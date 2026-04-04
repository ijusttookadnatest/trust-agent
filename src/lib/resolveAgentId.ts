import { agentsDb } from './db.js'

export function resolveAgentId(walletAddress: string, chain: string): number | null {
  const row = agentsDb.findByWalletAndChain(walletAddress, chain)
  return row ? row.agentId : null
}
