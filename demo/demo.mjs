import { AgentWallet } from "../src/wallet.mjs";
import { Policy } from "../src/policy.mjs";

// Demo: 1 approved payment, 1 blocked (over per-tx limit),
// 1 blocked (receiver not allowlisted). Run with: npm run demo
const wallet = new AgentWallet({
  owner: "owner.testnet",
  agent: "agentvault-agent.testnet",
  policy: new Policy({
    perTxLimit: 3,
    dailyLimit: 5,
    approvalThreshold: 2,
    allowlist: ["alice.testnet", "api-provider.testnet"],
  }),
});

console.log("AgentVault demo — agent wallet with spending limits");
console.log(`Agent: ${wallet.agent} | Starting balance: ${wallet.balance} NEAR`);
console.log("Policy: per-tx <= 3 NEAR, daily <= 5 NEAR, >= 2 NEAR needs owner approval, allowlist only\n");

const scenarios = [
  { to: "alice.testnet", amount: 0.5, purpose: "Pay for completed task" },
  { to: "alice.testnet", amount: 3.5, purpose: "Oversized payment (should be blocked)" },
  { to: "mallory.testnet", amount: 0.5, purpose: "Unknown receiver (should be blocked)" },
  { to: "api-provider.testnet", amount: 2.5, purpose: "Large payment (should wait for owner approval)" },
];

for (const s of scenarios) {
  const r = wallet.requestPayment(s);
  console.log(`- ${s.amount} NEAR -> ${s.to} (${s.purpose})`);
  console.log(`  => ${r.decision}${r.reason ? ` | ${r.reason}` : ""}`);
}

const approved = wallet.approvePending(0, "owner.testnet");
console.log(`\nOwner approves pending payment: ${approved.decision} (${approved.amount} NEAR -> ${approved.to})`);

console.log(`\nFinal balance: ${wallet.balance} NEAR | Spent today: ${wallet.spentToday} NEAR`);
console.log(`Ledger entries: ${wallet.ledger.length}`);
