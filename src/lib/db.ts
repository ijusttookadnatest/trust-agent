import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'trust-layer.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    walletAddress TEXT NOT NULL,
    agentId       INTEGER NOT NULL,
    chain         TEXT NOT NULL,
    ensName       TEXT,
    registeredAt  INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (walletAddress, chain)
  )
`)

export type AgentRow = {
  walletAddress: string
  agentId: number
  chain: string
  ensName: string | null
  registeredAt: number
}

export const agentsDb = {
  findByWallet: (walletAddress: string): AgentRow[] => {
    return db.prepare('SELECT * FROM agents WHERE walletAddress = ?').all(walletAddress) as AgentRow[]
  },

  findByWalletAndChain: (walletAddress: string, chain: string): AgentRow | null => {
    return db.prepare('SELECT * FROM agents WHERE walletAddress = ? AND chain = ?').get(walletAddress, chain) as AgentRow | null
  },

  insert: (row: Omit<AgentRow, 'registeredAt'>) => {
    db.prepare(`
      INSERT OR IGNORE INTO agents (walletAddress, agentId, chain, ensName)
      VALUES (@walletAddress, @agentId, @chain, @ensName)
    `).run(row)
  },

  updateEnsName: (walletAddress: string, ensName: string) => {
    db.prepare('UPDATE agents SET ensName = ? WHERE walletAddress = ?').run(ensName, walletAddress)
  },
}
