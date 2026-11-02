import { Policy } from "./policy.mjs";

// AgentVault wallet (MVP).
// The ledger here is the demo settlement layer: every approved payment is
// recorded with its decision trail. The NEAR testnet sender (src/near.mjs,
// next step) will replace ledger.record() with a real signed transfer, using
// exactly the same check() gate, so a blocked payment can never be broadcast.
export class AgentWallet {
  constructor({ owner, agent, policy }) {
    this.owner = owner;
    this.agent = agent;
    this.policy = policy ?? new Policy();
    this.balance = 10; // demo starting balance, NEAR
    this.spentToday = 0;
    this.ledger = [];
    this.pending = [];
  }

  requestPayment({ to, amount, purpose }) {
    const decision = this.policy.check({ to, amount, spentToday: this.spentToday });
    const entry = {
      at: new Date().toISOString(),
      from: this.agent,
      to,
      amount,
      purpose,
      decision: decision.ok ? "APPROVED" : decision.needsApproval ? "PENDING_OWNER_APPROVAL" : "BLOCKED",
      reason: decision.reason ?? null,
    };
    if (decision.needsApproval) {
      this.pending.push(entry);
      this.ledger.push(entry);
      return entry;
    }
    if (!decision.ok) {
      this.ledger.push(entry);
      return entry;
    }
    if (amount > this.balance) {
      const blocked = { ...entry, decision: "BLOCKED", reason: "INSUFFICIENT_BALANCE" };
      this.ledger.push(blocked);
      return blocked;
    }
    this.balance -= amount;
    this.spentToday += amount;
    this.ledger.push(entry);
    return entry;
  }

  approvePending(index, approver) {
    const entry = this.pending[index];
    if (!entry) return null;
    if (approver !== this.owner) return { ...entry, decision: "BLOCKED", reason: "APPROVER_NOT_OWNER" };
    if (entry.amount > this.balance) return { ...entry, decision: "BLOCKED", reason: "INSUFFICIENT_BALANCE" };
    this.balance -= entry.amount;
    this.spentToday += entry.amount;
    const approved = { ...entry, decision: "APPROVED_BY_OWNER", approvedBy: approver };
    this.ledger.push(approved);
    this.pending.splice(index, 1);
    return approved;
  }
}
