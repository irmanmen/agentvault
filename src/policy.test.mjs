import test from "node:test";
import assert from "node:assert/strict";
import { Policy } from "./policy.mjs";

const policy = new Policy({
  perTxLimit: 3,
  dailyLimit: 5,
  approvalThreshold: 2,
  allowlist: ["alice.testnet"],
});

test("allows a small payment to an allowlisted receiver", () => {
  assert.equal(policy.check({ to: "alice.testnet", amount: 0.5, spentToday: 0 }).ok, true);
});

test("blocks a payment over the per-transaction limit", () => {
  const r = policy.check({ to: "alice.testnet", amount: 3.5, spentToday: 0 });
  assert.equal(r.ok, false);
  assert.match(r.reason, /OVER_PER_TX_LIMIT/);
});

test("blocks a payment to a non-allowlisted receiver", () => {
  const r = policy.check({ to: "mallory.testnet", amount: 0.5, spentToday: 0 });
  assert.equal(r.ok, false);
  assert.match(r.reason, /RECEIVER_NOT_ALLOWLISTED/);
});

test("blocks a payment that would exceed the daily limit", () => {
  const r = policy.check({ to: "alice.testnet", amount: 0.5, spentToday: 4.8 });
  assert.equal(r.ok, false);
  assert.match(r.reason, /OVER_DAILY_LIMIT/);
});
