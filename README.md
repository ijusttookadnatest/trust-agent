# TrustAgent

A reputation API for agent-to-agent commerce. Call it before any interaction to verify whether an agent can be trusted.

## The problem

In agentic commerce, two agents meeting for the first time have no way to establish trust. A malicious actor can create an agent, defraud others, abandon it, and restart with a clean wallet. There's no history, no accountability.

## How it works

Each agent accumulates a reputation score based on real interaction feedback:

- **On-chain** — feedback is recorded via [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) on multiple chains (Sepolia + Hedera Testnet)
- **Cross-chain** — [Naryo](https://github.com/LF-Decentralized-Trust-labs/Naryo) listens to `giveFeedback()` events across all chains and correlates them into a single reputation history
- **TEE-computed** — the composite score is calculated inside a Flare TEE and cryptographically signed — no one can tamper with it
- **ENS-readable** — the signed score and attestation are stored in the agent's ENS text records, verifiable by anyone without calling the API

## Quick start

```typescript
// Check an agent's reputation before engaging (reads ENS, no API call)
const result = await fetch('https://reput-agent.xyz/resolve/agent-42.reput-agent.eth')
if (!result.verified || result.score < 50) return // invalid TEE signature or low score

// After an interaction — triggers TEE recompute + ENS update
await fetch('https://reput-agent.xyz/feedback', {
  method: 'POST',
  body: JSON.stringify({
    agentId: result.agentId,
    value: 85,
    tag1: 'successRate',
    proofOfPayment: '0xTxHash...'
  })
})
```

## API reference

### `POST /register`
Registers a new agent. Mints an ERC-8004 identity on each supported chain, creates an ENS subdomain (`agent-42.reput-agent.eth`), and writes initial trust records.

```
Body:   { walletAddress }
Return: { agentId, ensName }
```

### `POST /feedback`
The main endpoint. Records the interaction on-chain, triggers a Flare TEE recompute across all chains, and updates ENS. This is the only trigger for score recalculation.

```
Body:   { agentId, value (0-100), tag1, proofOfPayment? }
Return: { score, txHash }
```

One tx hash = one feedback. Double feedback on the same transaction is rejected.

### `GET /resolve/:ensName`
Reads trust credential directly from ENS and verifies the TEE signature locally — no API dependency, no trust required.

```
ecrecover(tee-signature, hash(walletAddress, score)) === TEE_PUBLIC_KEY
```

```json
{
  "score": 72,
  "reliability": 85,
  "seniority": 34,
  "interactionCount": 12,
  "signature": "0x...",
  "attestation": "0x...",
  "verified": true
}
```

## Score model

```
reliability = cross-chain average of ERC-8004 feedback scores (0–100)
seniority   = min(100, sqrt(totalInteractionCount) × 15)   ← diminishing returns
composite   = (reliability × 0.6) + (seniority × 0.4)
```

`interactionCount` aggregates validated feedbacks across all chains. An agent recreated from scratch starts at `seniority=0` — no serious agent accepts high-stakes transactions from a fresh wallet.

## Cross-chain architecture

```
Agent operates on Sepolia → giveFeedback() event emitted
Agent operates on Hedera  → giveFeedback() event emitted
         ↓
    Naryo listens to both chains in real-time
         ↓
  TEE aggregates scores cross-chain → signs composite
         ↓
  ENS updated with verified credential
```

The TEE reads ERC-8004 directly via RPC on each supported chain — no bridge, no oracle required.

## Why trust the score?

The TEE signature in ENS is the non-falsifiable element. Using `GET /resolve`, any agent can verify:

```
ecrecover(tee-signature, hash(walletAddress, score)) === TEE_PUBLIC_KEY
```

This works without calling our API, without trusting our infrastructure — the proof lives on-chain in ENS.

## Tech stack

| Component | Technology |
|-----------|-----------|
| Identity & reputation | ERC-8004 on Sepolia + Hedera Testnet |
| Cross-chain event indexing | Naryo multichain event listener |
| Score computation | Flare TEE Extensions |
| Trust credential storage | ENS text records (`agent-42.reput-agent.eth`) |

## Contracts

**Sepolia**
```
IDENTITY_REGISTRY   = 0xC768c4355206555f45aDE2192B3a24cf1EA36342
REPUTATION_REGISTRY = 0x3752b33ADeaF2883395803000eCb1418EEaea458
```

**Hedera Testnet** — to be deployed
