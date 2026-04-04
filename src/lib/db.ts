import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'trust-layer.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    walletAddress    TEXT NOT NULL,
    agentId          INTEGER NOT NULL,
    chain            TEXT NOT NULL,
    ensName          TEXT,
    registeredAt     INTEGER NOT NULL DEFAULT (unixepoch()),
    firstFeedbackAt  INTEGER,
    PRIMARY KEY (walletAddress, chain)
  );

  CREATE TABLE IF NOT EXISTS used_tx_hashes (
    txHash TEXT PRIMARY KEY,
    usedAt INTEGER NOT NULL DEFAULT (unixepoch())
  );
`)

// Migration pour les DBs existantes sans la colonne firstFeedbackAt
try { db.exec('ALTER TABLE agents ADD COLUMN firstFeedbackAt INTEGER') } catch {}

export type AgentRow = {
  walletAddress: string
  agentId: number
  chain: string
  ensName: string | null
  registeredAt: number
  firstFeedbackAt?: number | null
}

export const agentsDb = {
  findByWallet: (walletAddress: string): AgentRow[] => {
    return db.prepare('SELECT * FROM agents WHERE walletAddress = ?').all(walletAddress) as AgentRow[]
  },

  findByWalletAndChain: (walletAddress: string, chain: string): AgentRow | null => {
    return db.prepare('SELECT * FROM agents WHERE walletAddress = ? AND chain = ?').get(walletAddress, chain) as AgentRow | null
  },

  findByAgentId: (agentId: number): AgentRow | null => {
    return db.prepare('SELECT * FROM agents WHERE agentId = ?').get(agentId) as AgentRow | null
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

  setFirstFeedbackAt: (agentId: number, timestamp: number) => {
    db.prepare('UPDATE agents SET firstFeedbackAt = ? WHERE agentId = ? AND firstFeedbackAt IS NULL').run(timestamp, agentId)
  },
}

export const txHashDb = {
  isUsed: (txHash: string): boolean => {
    return !!db.prepare('SELECT 1 FROM used_tx_hashes WHERE txHash = ?').get(txHash)
  },

  markUsed: (txHash: string): void => {
    db.prepare('INSERT OR IGNORE INTO used_tx_hashes (txHash) VALUES (?)').run(txHash)
  },
}
