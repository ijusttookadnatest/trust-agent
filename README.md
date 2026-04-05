# TrustAgent

> Don't trust agents, verify them.

A cryptographic reputation layer for AI agents in agentic commerce. Trust scores are computed in a Flare TEE, signed with ECDSA, and stored in ENS — verifiable by anyone, without trusting any intermediary.

---

## The problem

In agentic commerce, two agents meeting for the first time have no way to establish trust. A malicious actor can create an agent, defraud others, abandon it, and restart with a clean wallet. There's no history, no accountability.

---

## The solution

TrustAgent addresses two distinct needs. First, aggregating a reliable reputation score across all chains an agent has ever operated on — an agent active on Sepolia, Hedera, and Base should carry a single unified track record, not three disconnected ones. Second, making that score tamper-proof when agents rate each other — since agents are autonomous, self-reported or peer-reported scores are trivially gameable without a neutral, verifiable computation layer. The Flare TEE is that layer: it aggregates cross-chain data and signs the result, so the score cannot be inflated by the agent being rated, the agent giving the rating, or the operator running the infrastructure.

---

## Architecture

Each agent gets an on-chain identity (ERC-8004), accumulates feedback across multiple chains, and receives a TEE-signed score stored in ENS.

```
Agent A pays Agent B → giveFeedback() emitted on-chain
                              ↓
              Naryo listens across Sepolia + Hedera (+ any chain)
                              ↓
         TEE aggregates cross-chain data → computes score → signs it
                              ↓
            ENS text records updated: trust-score, tee-signature, reliability, seniority
                              ↓
     Any buyer reads ENS directly → runs ecrecover → verifies signature locally
```

No bridge. No oracle. No API call required to verify.

---

## Score model

```
reliability = aggregate of ERC-8004 on-chain feedbacks (0–100)
seniority   = f(firstInteractionDate, totalInteractionCount)
composite   = (reliability × 0.6) + (seniority × 0.4)
```

An agent recreated from scratch starts at seniority=0. No serious counterpart accepts high-stakes transactions from a wallet with no history.

---

## Why trust the score?

The TEE signature stored in ENS is the non-falsifiable element. Any agent verifies it locally:

```
ecrecover(tee-signature, hash(walletAddress, score)) === TEE_PUBLIC_KEY
```

The data lives on-chain in ENS. The verification runs locally — no API, no trust in the operator required.

---

## API

**POST /register** — mints ERC-8004 identity, creates ENS subdomain (agent-42.reputagent.eth), writes initial text records.

**POST /feedback** — records giveFeedback() on-chain, triggers TEE recomputation, updates ENS. When proofOfPayment is provided, the backend verifies the USDC tx on-chain (correct contract, sender, recipient, no reuse). One tx hash = one feedback.

**GET /agents** — lists all registered agents.

---

## Vision

TrustAgent is currently a standalone platform showcasing the full flow. The intended end state is a lightweight SDK that any agentic marketplace integrates as a pre-interaction hook — letting buyer agents verify seller agents before committing to a transaction.

Marketplaces can go further and enforce registration as a listing requirement: only agents with a valid TrustAgent identity (minted ERC-8004, ENS subdomain) are allowed to market their services on the platform. This creates a baseline accountability layer — agents can't list anonymously, and their on-chain history is visible to every potential counterpart before the first transaction.

The broader ambition is to provide the infrastructure layer on top of which a standard for evaluating agent performance could eventually be defined — what dimensions matter, how they are weighted, what thresholds are meaningful. That standardization is out of scope here, but the architecture is built to support it: the score model is composable, the TEE signs whatever the computation produces, and ENS stores it immutably.

---

## Roadmap

- [x] ERC-8004 Identity & Reputation Registry on Sepolia
- [x] Flare TEE — score computed inside enclave on Coston2, signed with ECDSA secp256k1
- [x] ENS subdomains — trust-score, reliability, seniority, tee-signature stored as text records after every feedback
- [x] Trustless client-side verification — ecrecover against TEE public key, zero API dependency
- [ ] ERC-8004 on multiple EVM chains
- [ ] Naryo — event-driven pipeline listening to giveFeedback() across chains, triggers background TEE recomputation with proof of payment attestation
- [ ] SDK — standalone npm package embeddable in any agentic marketplace
- [ ] Production TEE attestation — full GCP enclave attestation replacing local mode

---

## Acknowledgements

Thanks to the ENS team for their support and tooling. Thanks to the Flare team for their guidance on TEE Extensions.

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
