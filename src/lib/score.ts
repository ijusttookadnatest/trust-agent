import { getReputationRegistry } from './contracts.js'

export type ScoreResult = {
  score: number
  reliability: number
  seniority: number
  interactionCount: number
  teeSignature: string
  teeAttestation: string
}

export async function computeScore(agentId: number): Promise<ScoreResult> {
  const registry = getReputationRegistry()

  const clients: string[] = [...(await registry.getClients(agentId))]
  const { count, avgValue } = await registry.getSummary(agentId, clients)

  const interactionCount = Number(count)
  // We enforce valueDecimals=0 in giveFeedback (value 0-100)
  // avgValue is int128 — clamp to 0-100 to guard against external callers with different decimals
  const rawAvg = Number(avgValue)
  const reliability = Math.min(100, Math.max(0, rawAvg > 100 ? Math.round(rawAvg / 100) : rawAvg))

  // Diminishing returns — first interactions count more than later ones
  // sqrt(1)*15=15, sqrt(4)*15=30, sqrt(9)*15=45, sqrt(44)*15≈100
  const seniority = Math.min(100, Math.round(Math.sqrt(interactionCount) * 15))

  const score = Math.round(reliability * 0.6 + seniority * 0.4)

  // TODO(TEE): replace with actual Flare TEE call
  // POST process.env.TEE_URL/action { agentId, reliability, seniority }
  // → { score, signature, attestation }
  const teeSignature = '0xTEE_STUB'
  const teeAttestation = '0xTEE_STUB'

  return { score, reliability, seniority, interactionCount, teeSignature, teeAttestation }
}
