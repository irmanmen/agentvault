import { AgentWallet } from "../src/wallet.mjs";
import { Policy } from "../src/policy.mjs";
import { connectTestnet } from "../src/near.mjs";

// Testnet demo: the SAME policy gate as demo.mjs, but an approved payment
// is settled with a real signed NEAR testnet transfer. Blocked payments
// produce no transaction at all. Run with: node demo/demo-testnet.mjs
// Requires .testnet-key.json (gitignored, testnet only).
const near = await connectTestnet();
const wallet = new AgentWallet({
  owner: "owner.testnet",
  agent: near.accountId,
  policy: new Policy({
    perTxLimit: 3,
    dailyLimit: 5,
    approvalThreshold: 2,
    allowlist: ["agentvault-alice.testnet"],
  }),
});

console.log(`AgentVault testnet demo — agent: ${near.accountId}`);
console.log(`On-chain balance before: ${await near.balanceNear()} NEAR\n`);

const attempts = [
  { to: "agentvault-alice.testnet", amount: 0.5, purpose: "Pay for completed task" },
  { to: "agentvault-alice.testnet", amount: 3.5, purpose: "Oversized (should be blocked, no tx)" },
  { to: "mallory.testnet", amount: 0.5, purpose: "Unknown receiver (should be blocked, no tx)" },
];

for (const a of attempts) {
  const decision = wallet.policy.check({ to: a.to, amount: a.amount, spentToday: wallet.spentToday });
  if (!decision.ok) {
    console.log(`- ${a.amount} NEAR -> ${a.to}: BLOCKED | ${decision.reason} | tx: none`);
    wallet.ledger.push({ ...a, decision: "BLOCKED", reason: decision.reason });
    continue;
  }
  const hash = await near.send(a.to, a.amount);
  wallet.spentToday += a.amount;
  console.log(`- ${a.amount} NEAR -> ${a.to}: SENT | tx: ${hash}`);
  console.log(`  https://testnet.nearblocks.io/txns/${hash}`);
}

console.log(`\nOn-chain balance after: ${await near.balanceNear()} NEAR`);
console.log(`Spent today (policy ledger): ${wallet.spentToday} NEAR`);
