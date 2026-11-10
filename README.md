# Temple Grab — NEAR Edition

**Explore. Collect. Earn. Own.**

Temple Grab is a skill-first arcade treasure runner being rebuilt for the NEAR Hackathon 2026, primarily for **Games With Real Economies**.

## Run the game locally

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

## How to play

- Press **Enter** or click **Start Run**.
- Use **← / →** or **A / D** to switch lanes.
- On mobile, use the left and right arrow controls.
- Collect glowing relics and avoid falling stone traps.
- Your best score is saved locally in your browser.

## NEAR testnet setup

1. Install Rust and the WebAssembly target:

   ```bash
   rustup target add wasm32-unknown-unknown
   ```

2. Build the contract:

   ```bash
   cargo build --manifest-path contract/Cargo.toml --target wasm32-unknown-unknown --release
   ```

3. Deploy the generated WASM file to a NEAR testnet account and initialize it. Follow [contract/README.md](contract/README.md) for the deployment commands.

4. Set the deployed account in your frontend `.env` file:

   ```env
   VITE_NEAR_CONTRACT_ID=your-account.testnet
   ```

5. Restart the Vite dev server, connect a NEAR testnet wallet, finish a run, then choose **Submit best score to NEAR**.

## Current features

- Responsive three-lane arcade runner with keyboard and mobile controls.
- Collectible relics, falling traps, increasing speed, score and local personal best.
- NEAR Connect wallet integration configured for testnet.
- NEAR smart contract for wallet-linked best scores.
- GitHub Actions build check for the frontend and contract.

## Trust model and roadmap

The contract stores each connected wallet's best submitted score and exposes a public leaderboard view. Scores are currently **self-reported by the game client**. The contract caps score values and only updates a player's best result, but a modified client can still submit an inflated score. The leaderboard is informational only: it does not issue tokens, NFTs, or financial rewards.

Next milestones:
- [ ] Server-side or deterministic replay validation for scores.
- [ ] Public leaderboard UI backed by the deployed contract.
- [ ] Player-owned collectible NFTs.
- [ ] NPC merchant and player-owned item marketplace.

Do not attach valuable rewards to scores until gameplay results can be independently verified.

## Background

This is a clean rebuild inspired by the original Temple Grab prototype at https://temple-grab.netlify.app/. The original is a reference for the game concept, not the codebase for this NEAR edition.

## Track

NEAR Hackathon 2026 — Games With Real Economies.

## License

MIT
