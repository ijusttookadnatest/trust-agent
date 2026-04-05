import { Router } from 'express'
import type { Request, Response, IRouter } from 'express'
import Database from 'better-sqlite3'
import path from 'path'

export const agentsRouter: IRouter = Router()

const db = new Database(path.join(process.cwd(), 'trust-layer.db'))

agentsRouter.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM agents ORDER BY agentId ASC').all() as {
    walletAddress: string
    agentId: number
    chain: string
    ensName: string | null
    registeredAt: number
  }[]

  console.log(`[agents] GET /agents → ${rows.length} agents`)

  const agents = rows.map(r => ({
    agentId: r.agentId,
    ensName: r.ensName ?? `agent-${r.agentId}.reputagent.eth`,
    walletAddress: r.walletAddress,
    chain: r.chain,
    registeredAt: r.registeredAt,
    score: 0,
    reliability: 0,
    seniority: 0,
    interactionCount: 0,
    tag: '',
    category: 'Unknown',
    teeSignature: '',
    verified: false,
  }))

  res.json({ agents })
})
