use near_sdk::store::UnorderedMap;
use near_sdk::{env, near, AccountId, PanicOnDefault};

const MAX_SCORE: u64 = 1_000_000;

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct TempleGrab {
    best_scores: UnorderedMap<AccountId, u64>,
}

#[near]
impl TempleGrab {
    #[init]
    pub fn new() -> Self {
        Self {
            best_scores: UnorderedMap::new(b"best_scores".as_slice()),
        }
    }

    /// Store the caller's best score. This leaderboard is informational only:
    /// client-submitted scores are not independently verified and never trigger payouts.
    pub fn submit_score(&mut self, score: u64) {
        assert!(score <= MAX_SCORE, "Score exceeds the maximum allowed value");
        let player = env::predecessor_account_id();
        let previous = self.best_scores.get(&player).copied().unwrap_or(0);
        if score > previous {
            self.best_scores.insert(player, score);
        }
    }

    pub fn get_best_score(&self, player: AccountId) -> u64 {
        self.best_scores.get(&player).copied().unwrap_or(0)
    }

    pub fn get_leaderboard(&self, limit: u32) -> Vec<(AccountId, u64)> {
        let mut entries: Vec<(AccountId, u64)> = self
            .best_scores
            .iter()
            .map(|(account, score)| (account.clone(), *score))
            .collect();
        entries.sort_by(|a, b| b.1.cmp(&a.1));
        entries.truncate(limit.min(50) as usize);
        entries
    }
}
