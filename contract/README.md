# Temple Grab contract

A NEAR smart contract for a wallet-linked best-score leaderboard.

## Build

Install Rust and the WebAssembly target:

```bash
rustup target add wasm32-unknown-unknown
cargo build --manifest-path contract/Cargo.toml --target wasm32-unknown-unknown --release
```

The WASM artifact is written to `contract/target/wasm32-unknown-unknown/release/temple_grab_contract.wasm`.

## Deploy to testnet

Create or use a NEAR testnet account, then deploy with NEAR CLI:

```bash
near contract deploy <your-account>.testnet use-file contract/target/wasm32-unknown-unknown/release/temple_grab_contract.wasm without-init-call network-config testnet sign-with-keychain send
near contract call-function as-transaction <your-account>.testnet new json-args '{}' prepaid-gas '30.0 Tgas' attached-deposit '0 NEAR' sign-with-keychain send --networkId testnet
```

Set `VITE_NEAR_CONTRACT_ID=<your-account>.testnet` in the frontend environment.

## Methods

- `new()` — initialize the leaderboard.
- `submit_score({ score })` — record the caller's best score.
- `get_best_score({ player })` — read one player's best score.
- `get_leaderboard({ limit })` — read up to 50 top scores.

## Trust model

Scores are submitted by the connected player and are **not independently verified**. The contract caps scores and only stores a player's best result, but a modified client can still submit an inflated score. This leaderboard is informational; it does not distribute tokens, NFTs, or other rewards. Do not attach valuable rewards until game results can be verified server-side or through deterministic replay validation.
