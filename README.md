# Temple Grab — NEAR Edition

**Explore. Collect. Earn. Own.**

Temple Grab is a skill-first arcade treasure runner being rebuilt for the NEAR Hackathon 2026, primarily for **Games With Real Economies**.

## Play locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## How to play

- Press **Enter** or click **Start Run**.
- Use **← / →** or **A / D** to switch lanes.
- On mobile, use the left and right arrow controls.
- Collect glowing relics and avoid falling stone traps.
- Your best score is saved locally in your browser.

## Current implementation

- Responsive arcade game interface and three-lane runner loop.
- Increasing game speed, collectible relics, obstacles, score and local best score.
- Keyboard and touch-friendly controls.
- NEAR-themed game economy UI.

## Roadmap

- [ ] NEAR wallet authentication (HOT Connect)
- [ ] Contract-backed player profiles and leaderboard
- [ ] Onchain collectible relics
- [ ] NPC merchant with player-owned inventory
- [ ] Secure, verifiable reward claims

**Important:** Wallet, leaderboard, marketplace and reward panels are currently visual placeholders. No wallet is connected and no tokens or NFTs are currently issued. Client-side scores are not trusted for payouts. Those features will only be enabled after contract-side validation and limits are implemented.

## Background

This is a clean rebuild inspired by the original Temple Grab prototype at https://temple-grab.netlify.app/. The original is a reference for the game concept, not the codebase for this NEAR edition.

## Track

NEAR Hackathon 2026 — Games With Real Economies.

## License

MIT
