// AgentVault policy engine.
// Rules are checked BEFORE any payment is signed or sent, so a blocked
// payment never reaches the chain. Amounts are in NEAR (numbers, for the MVP demo).
export class Policy {
  constructor({
    perTxLimit = 1,
    dailyLimit = 5,
    approvalThreshold = 2,
    allowlist = [],
  } = {}) {
    this.perTxLimit = perTxLimit;
    this.dailyLimit = dailyLimit;
    this.approvalThreshold = approvalThreshold;
    this.allowlist = new Set(allowlist);
  }

  // Returns { ok: true } or { ok: false, reason } or { ok: false, needsApproval: true, reason }.
  check({ to, amount, spentToday }) {
    if (!this.allowlist.has(to)) {
      return { ok: false, reason: `RECEIVER_NOT_ALLOWLISTED: ${to} is not on the allowlist` };
    }
    if (amount > this.perTxLimit) {
      return { ok: false, reason: `OVER_PER_TX_LIMIT: ${amount} NEAR > ${this.perTxLimit} NEAR per transaction` };
    }
    if (spentToday + amount > this.dailyLimit) {
      return { ok: false, reason: `OVER_DAILY_LIMIT: ${spentToday} + ${amount} NEAR > ${this.dailyLimit} NEAR daily limit` };
    }
    if (amount >= this.approvalThreshold) {
      return { ok: false, needsApproval: true, reason: `NEEDS_OWNER_APPROVAL: ${amount} NEAR >= ${this.approvalThreshold} NEAR approval threshold` };
    }
    return { ok: true };
  }
}
