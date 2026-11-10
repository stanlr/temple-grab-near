# Temple Grab — NEAR Edition

**Explore. Collect. Earn. Own.**

Temple Grab is an arcade treasure-runner being rebuilt for the NEAR Hackathon 2026, Games With Real Economies track. The goal is to combine fast, accessible gameplay with a player-owned economy powered by NEAR.

## Project status

🚧 Early development. This repository is the clean rebuild; the existing game remains available at https://temple-grab.netlify.app/ as a reference.

Planned milestones:
- [x] Establish a clean project repository
- [ ] Build the playable arcade loop
- [ ] Add NEAR wallet authentication
- [ ] Add contract-backed score submissions and reward claims
- [ ] Add player-owned collectibles
- [ ] Add leaderboard and in-game merchant

## Development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Hackathon direction

The game will preserve a simple, skill-first arcade experience. NEAR integrations should create real utility: wallet identity, verifiable score/reward flows, and ownership of game collectibles. Testnet will be used during development. No real-money rewards are promised.

## Security notes

Client-side scores and browser storage are not trusted sources for payouts. Reward claims must be constrained by contract-side rules and validated game results before any valuable assets are distributed.

## License

MIT
