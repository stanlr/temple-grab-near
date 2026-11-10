import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Coins, Trophy, Zap, Volume2, VolumeX, Play, RotateCcw, Wallet, ShieldCheck, Sparkles } from 'lucide-react';

const LANES = [0, 1, 2];
const STARTING_SPEED = 4.2;
const randomLane = () => Math.floor(Math.random() * 3);

function App() {
  const [lane, setLane] = useState(1);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [loot, setLoot] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('temple-best') || 0));
  const [status, setStatus] = useState('ready');
  const [muted, setMuted] = useState(true);
  const [wallet, setWallet] = useState('');
  const [walletInstance, setWalletInstance] = useState(null);
  const [txStatus, setTxStatus] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const connectorRef = useRef(null);
  const contractId = import.meta.env.VITE_NEAR_CONTRACT_ID;
  const [distance, setDistance] = useState(0);
  const [flash, setFlash] = useState(false);
  const gameRef = useRef({ lane: 1, items: [], lastSpawn: 0, lastTick: 0, score: 0, loot: 0, speed: STARTING_SPEED, running: false });
  const rafRef = useRef(null);

  const startGame = useCallback(() => {
    gameRef.current = { lane: 1, items: [], lastSpawn: 0, lastTick: 0, score: 0, loot: 0, speed: STARTING_SPEED, running: true };
    setLane(1); setItems([]); setScore(0); setLoot(0); setDistance(0); setStatus('playing');
  }, []);

  const move = useCallback((direction) => {
    if (status !== 'playing') return;
    const next = Math.max(0, Math.min(2, gameRef.current.lane + direction));
    gameRef.current.lane = next;
    setLane(next);
  }, [status]);

  const refreshLeaderboard = useCallback(async () => {
    if (!contractId) return;
    try {
      const response = await fetch('https://rpc.testnet.near.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 'temple-grab', method: 'query',
          params: { request_type: 'call_function', finality: 'final', account_id: contractId, method_name: 'get_leaderboard', args_base64: btoa(JSON.stringify({ limit: 5 })) },
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const entries = JSON.parse(new TextDecoder().decode(new Uint8Array(data.result.result)));
      setLeaderboard(Array.isArray(entries) ? entries : []);
    } catch (error) {
      console.error('Could not load NEAR leaderboard:', error);
    }
  }, [contractId]);

  useEffect(() => { refreshLeaderboard(); }, [refreshLeaderboard]);

  const finishGame = useCallback(() => {
    gameRef.current.running = false;
    setStatus('over');
    setBest((old) => {
      const next = Math.max(old, gameRef.current.score);
      localStorage.setItem('temple-best', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const tick = (time) => {
      const g = gameRef.current;
      if (!g.running) return;
      const dt = Math.min((time - (g.lastTick || time)) / 16.67, 2.2);
      g.lastTick = time;
      g.score += Math.max(0.2, g.speed * 0.11) * dt;
      g.speed = Math.min(9, STARTING_SPEED + g.score / 340);
      g.items = g.items
        .map((item) => ({ ...item, y: item.y + g.speed * dt }))
        .filter((item) => item.y < 112);
      if (time - g.lastSpawn > Math.max(560, 1050 - g.score * 0.6)) {
        const laneOne = randomLane();
        const isCoin = Math.random() > 0.48;
        g.items.push({ id: time + Math.random(), lane: laneOne, y: -12, type: isCoin ? 'coin' : 'rock' });
        if (!isCoin && Math.random() > 0.72) {
          const safe = (laneOne + 1 + Math.floor(Math.random() * 2)) % 3;
          g.items.push({ id: time + 0.2, lane: safe, y: -36, type: 'coin' });
        }
        g.lastSpawn = time;
      }
      const collisionY = 77;
      const hit = g.items.find((item) => item.lane === g.lane && item.y > collisionY - 5 && item.y < collisionY + 8);
      if (hit?.type === 'rock') {
        finishGame();
        return;
      }
      const collected = g.items.filter((item) => item.lane === g.lane && item.type === 'coin' && item.y > collisionY - 6 && item.y < collisionY + 8);
      if (collected.length) {
        g.loot += collected.length;
        g.items = g.items.filter((item) => !collected.includes(item));
        setLoot(g.loot);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 140);
      }
      setScore(Math.floor(g.score));
      setDistance(Math.floor(g.score * 1.8));
      setItems([...g.items]);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, finishGame]);

  useEffect(() => {
    const onKey = (event) => {
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); move(-1); }
      if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); move(1); }
      if (['Enter', ' '].includes(event.key) && status !== 'playing') { event.preventDefault(); startGame(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, status, startGame]);

  const submitScore = async () => {
    if (!walletInstance || !contractId) {
      setTxStatus('Deploy the testnet contract and set VITE_NEAR_CONTRACT_ID first.');
      return;
    }
    try {
      setTxStatus('Waiting for wallet approval...');
      await walletInstance.signAndSendTransaction({
        receiverId: contractId,
        actions: [{ type: 'FunctionCall', params: { methodName: 'submit_score', args: { score: Math.floor(gameRef.current.score) }, gas: '30000000000000', deposit: '0' } }],
      });
      setTxStatus('Best score saved on NEAR testnet.');
      await refreshLeaderboard();
    } catch (error) {
      console.error('Score submission failed:', error);
      setTxStatus('Score submission was cancelled or failed.');
    }
  };

  const connectWallet = async () => {
    try {
      if (!connectorRef.current) {
        const { NearConnector } = await import('@hot-labs/near-connect');
        const connector = new NearConnector({ network: 'testnet', features: { testnet: true }, footerBranding: null });
        connectorRef.current = connector;
        connector.on('wallet:signIn', async ({ accounts }) => {
          setWallet(accounts?.[0]?.accountId || 'Connected');
          try { setWalletInstance(await connector.wallet()); } catch { setWalletInstance(null); }
        });
        connector.on('wallet:signOut', () => { setWallet(''); setWalletInstance(null); });
      }
      if (wallet) await connectorRef.current.disconnect();
      else await connectorRef.current.connect();
    } catch (error) {
      console.error('NEAR wallet connection failed:', error);
      setWallet('Connection failed');
      window.setTimeout(() => setWallet(''), 2200);
    }
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#" aria-label="Temple Grab home">
          <span className="brand-mark">TG</span><span>TEMPLE<span className="brand-light">GRAB</span></span>
          <span className="edition">NEAR EDITION</span>
        </a>
        <div className="top-actions">
          <div className="network-pill"><span className="pulse-dot" /> BUILT FOR NEAR</div>
          <button className="wallet-button" onClick={connectWallet}><Wallet size={15} /> {wallet ? (wallet === 'Connection failed' ? wallet : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`) : 'Connect wallet'}</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> THE TEMPLE IS CALLING</div>
          <h1>RUN FOR THE<br /><span className="headline-accent">ANCIENT</span> LOOT.</h1>
          <p className="hero-description">Dash through forgotten ruins. Dodge the traps. Grab every relic. How far can you make it?</p>
          <div className="hero-meta"><span><Zap size={14} /> SKILL FIRST</span><i /> <span><ShieldCheck size={14} /> PLAYER OWNED</span><i /> <span><Sparkles size={14} /> ON NEAR</span></div>
        </div>
        <div className="stats-panel">
          <div className="stat-block"><span className="stat-label">BEST RUN</span><strong>{best.toLocaleString()}</strong><span className="stat-foot"><Trophy size={12} /> PERSONAL RECORD</span></div>
          <div className="stat-divider" />
          <div className="stat-block"><span className="stat-label">RELICS FOUND</span><strong>{loot.toString().padStart(2, '0')}</strong><span className="stat-foot"><Coins size={12} /> THIS RUN</span></div>
        </div>
      </section>

      <section className="game-layout">
        <div className="game-column">
          <div className="game-topline"><div><span className="live-indicator" /> {status === 'playing' ? 'RUN IN PROGRESS' : status === 'over' ? 'RUN ENDED' : 'READY WHEN YOU ARE'}</div><span className="mono">SECTOR 01 <b>/</b> THE LOST TEMPLE</span></div>
          <div className={`game-frame ${flash ? 'collect-flash' : ''}`}>
            <div className="scene-sky" />
            <div className="temple-glow" />
            <div className="temple-silhouette"><span className="temple-roof" /><span className="temple-columns"><i /><i /><i /><i /><i /></span><span className="temple-door" /></div>
            <div className="jungle jungle-left">🌿</div><div className="jungle jungle-right">🌿</div>
            <div className="track">
              <div className="track-line line-one" /><div className="track-line line-two" />
              {LANES.map((n) => <div className="lane" key={n} />)}
              {items.map((item) => <div key={item.id} className={`falling-item ${item.type}`} style={{ left: `${16.7 + item.lane * 33.3}%`, top: `${item.y}%` }}>{item.type === 'coin' ? '✦' : '🪨'}</div>)}
              <div className="runner-shadow" style={{ left: `${16.7 + lane * 33.3}%` }} />
              <div className="runner" style={{ left: `${16.7 + lane * 33.3}%` }} aria-label="Player character">🏃</div>
            </div>
            <div className="scene-vignette" />
            <div className="hud hud-left"><span className="hud-caption">SCORE</span><strong>{score.toString().padStart(5, '0')}</strong></div>
            <div className="hud hud-right"><span className="hud-caption">RELICS</span><strong><span className="gold-text">✦</span> {loot}</strong></div>
            {status !== 'playing' && <div className="game-overlay">
              <div className="overlay-card">
                <span className="overlay-kicker">{status === 'over' ? 'THE TEMPLE CLAIMS ANOTHER' : 'YOUR ADVENTURE STARTS HERE'}</span>
                <h2>{status === 'over' ? 'RUN COMPLETE' : 'READY, RUNNER?'}</h2>
                <p>{status === 'over' ? `You collected ${loot} relics and scored ${score} points. The ruins await your return.` : 'Collect the glowing relics. Avoid the stone traps. Stay alive as the temple gets faster.'}</p>
                <button className="start-button" onClick={startGame}><Play size={16} fill="currentColor" /> {status === 'over' ? 'RUN IT BACK' : 'START RUN'}</button>
                {status === 'over' && walletInstance && <button className="submit-score-button" onClick={submitScore}>SUBMIT BEST SCORE TO NEAR</button>}
                {txStatus && <span className="tx-status">{txStatus}</span>}
                <span className="overlay-hint">PRESS ENTER TO PLAY</span>
              </div>
            </div>}
            <div className="distance-tag"><span>↗</span> {distance.toLocaleString()}M</div>
          </div>
          <div className="game-controls">
            <div className="control-copy"><span className="control-title">CONTROLS</span><span>Switch lanes to dodge traps and collect relics.</span></div>
            <div className="key-hints"><span className="keycap"><ArrowLeft size={14} /></span><span className="keycap"><ArrowRight size={14} /></span><span className="key-note">OR A / D</span></div>
            <div className="mobile-controls"><button onClick={() => move(-1)} aria-label="Move left"><ArrowLeft /></button><button onClick={() => move(1)} aria-label="Move right"><ArrowRight /></button></div>
          </div>
        </div>

        <aside className="side-column">
          <div className="side-card mission-card">
            <div className="card-heading"><span className="card-icon"><Trophy size={16} /></span><span>RUN OBJECTIVE</span><span className="card-index">01</span></div>
            <h3>GREED IS GOOD.<br /><em>GET OUT ALIVE.</em></h3>
            <p>Every relic adds to your run. One collision ends it all.</p>
            <div className="objective-row"><span>COLLECT RELICS</span><b>✦ +1</b></div>
            <div className="objective-row"><span>HIT A TRAP</span><b className="danger">RUN OVER</b></div>
          </div>
          <div className="side-card economy-card">
            <div className="card-heading"><span className="card-icon green"><Coins size={16} /></span><span>TREASURE ECONOMY</span><span className="soon-tag">IN BUILD</span></div>
            <div className="economy-art"><div className="coin-stack">✦<span>✦</span><i>✦</i></div><div><strong>YOUR LOOT.<br />YOUR LEGACY.</strong><small>Relics will become player-owned collectibles on NEAR.</small></div></div>
            <div className="economy-footer"><span><span className="mini-dot" /> ONCHAIN REWARDS</span><span>COMING SOON</span></div>
          </div>
          <div className="side-card leaderboard-card">
            <div className="card-heading"><span className="card-icon"><Sparkles size={16} /></span><span>HALL OF EXPLORERS</span></div>
            {leaderboard.length > 0 ? <div className="leaderboard-list">{leaderboard.map(([account, value], index) => <div className="leaderboard-row" key={account}><span className="leader-rank">{String(index + 1).padStart(2, '0')}</span><span className="leader-account">{account}</span><strong>{Number(value).toLocaleString()}</strong></div>)}</div> : <div className="empty-board"><Trophy size={21} /><span>THE FIRST LEGEND<br />COULD BE YOU.</span><small>{contractId ? 'No scores submitted yet.' : 'Leaderboard opens after testnet setup.'}</small></div>}
          </div>
        </aside>
      </section>

      <footer className="footer"><div>© 2026 TEMPLE GRAB <span>·</span> AN ARCADE ADVENTURE</div><div className="footer-center">EXPLORE <b>·</b> COLLECT <b>·</b> EARN <b>·</b> OWN</div><button className="sound-toggle" onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={14} /> : <Volume2 size={14} />} SOUND {muted ? 'OFF' : 'ON'}</button></footer>
    </main>
  );
}

export default App;