# AgentVault — an AI agent wallet with spending limits

Built for the **NEAR HACKATHON (1–14 Nov 2026), Agent Economy track**:
give an AI agent a wallet without giving it the keys to everything.

## The problem

An agent that can spend needs guardrails. Without them, one bad instruction
(or one compromised prompt) can drain the wallet.

## What it does

Every payment an agent requests is checked **before** it is signed or sent:

- **Allowlist only** — unknown receivers are blocked.
- **Per-transaction limit** — oversized payments are blocked.
- **Daily limit** — spending that would exceed the day's budget is blocked.
- **Owner approval** — payments at or above the approval threshold wait in a
  pending queue until the owner approves them.
- **Full ledger** — every attempt (approved, blocked, pending) is recorded
  with its decision and reason, so nothing is silent.

A blocked payment never reaches the chain.

## Run it (no account, no keys needed for the demo)

Requires Node.js 20+.

```bash
npm run demo
```

Expected output: one approved payment (0.5 NEAR), one blocked payment
(over the per-transaction limit), one blocked payment (receiver not
allowlisted), one payment held for owner approval and then approved by the
owner. Final balance: 7 NEAR, spent today: 3 NEAR.

## Run the tests

```bash
npm test
```

## Project layout

- `src/policy.mjs` — the spending rules, checked before signing.
- `src/wallet.mjs` — the agent wallet: payments, pending approvals, ledger.
- `demo/demo.mjs` — the demo scenario above.
- `src/policy.test.mjs` — tests for the four policy rules.

## Testnet demo (real signed transfer, same policy gate)

The testnet demo uses the exact same `policy.check()` gate, but an approved
payment is settled with a real signed NEAR testnet transfer. It needs a
testnet key file (gitignored, testnet only) at `.testnet-key.json`:

```json
{"accountId": "your-agent.testnet", "privateKey": "ed25519:..."}
```

Create a testnet account with that key via
`https://helper.testnet.near.org/account`, then run:

```bash
npm run demo:testnet
```

Verified 2026-11-02: agent `agentvault-agent.testnet` sent 0.5 NEAR to
`agentvault-alice.testnet` (tx
`LatB3RzgNQufK3AXwWWVR9XuRb4awKFiAnobRdws8Dp`, balance 9.9981 → 9.4981
NEAR), while the over-limit and non-allowlisted attempts produced no
transaction at all.

## Next step (before submission)

Publish this repository, post the demo on X tagging @NEARProtocol with
#NEARHackathon, and submit both links before 14 Nov 2026, 23:59 UTC.

## License

MIT
