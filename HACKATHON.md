# HACKATHON.md — AgentVault for the NEAR HACKATHON

## What this is

AgentVault is an AI agent wallet with spending limits, built for the
**NEAR HACKATHON (1–14 November 2026), Agent Economy track**.
An agent can spend, but only within rules set by its owner: an allowlist,
a per-transaction limit, a daily limit, and an owner-approval threshold
for large payments. Every attempt is logged, approved or blocked, before
any payment is signed.

## How to run it

Requires Node.js 20+.

```bash
npm install
npm run demo        # offline demo, no account needed
npm test            # policy tests
```

Testnet demo (real signed transfer, same policy gate):

```bash
# create .testnet-key.json (gitignored, testnet only):
# {"accountId": "your-agent.testnet", "privateKey": "ed25519:..."}
npm run demo:testnet
```

Verified 2026-11-02: `agentvault-agent.testnet` sent 0.5 NEAR to
`agentvault-alice.testnet` on testnet (tx
`LatB3RzgNQufK3AXwWWVR9XuRb4awKFiAnobRdws8Dp`), while over-limit and
non-allowlisted attempts produced no transaction.

## Submission checklist (before 14 Nov 2026, 23:59 UTC)

1. This repository is public.
2. Demo post on X: say it was built at NEAR HACKATHON, tag
   @NEARProtocol and #NEARHackathon, attach a demo video or screenshots.
3. Submit both links (repository + demo post) through the form at
   nearhackathon.com. Results are announced by 18 Nov 2026, 23:59 UTC.

## Security note

`.testnet-key.json` is gitignored and must never be committed. The demo
and testnet accounts are testnet-only and hold no mainnet value.
