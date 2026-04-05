import { useState } from 'react'
import { MOCK_AGENTS, MOCK_REVIEWS, CATEGORIES, FEATURED_CATEGORIES, type Agent } from './mockData'
import './index.css'

const API = 'http://localhost:3000'

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return '#00b67a'
  if (score >= 60) return '#73cf11'
  if (score >= 40) return '#ff8622'
  return '#ff3722'
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  return 'Poor'
}

function ScoreStars({ score, size = 20 }: { score: number; size?: number }) {
  const filled = Math.round((score / 100) * 5)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: size, height: size, borderRadius: 3,
          background: i <= filled ? scoreColor(score) : '#dcdce6',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function AgentAvatar({ agentId, size = 72 }: { agentId: number; size?: number }) {
  const colors = ['#00b67a', '#2d6cdf', '#9b4dca', '#e67e22', '#e74c3c', '#1abc9c', '#f39c12', '#8e44ad']
  const emojis = ['🤖', '🦾', '🧠', '⚡', '🔮', '🛡️', '🌐', '🚀']
  const bg = colors[agentId % colors.length]
  const emoji = emojis[agentId % emojis.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 40 ? 12 : '50%',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.45, flexShrink: 0,
    }}>
      {emoji}
    </div>
  )
}

// ── Agent card (Trustpilot-style with top banner) ─────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const colors = ['#00b67a', '#2d6cdf', '#9b4dca', '#e67e22', '#e74c3c', '#1abc9c', '#f39c12', '#8e44ad']
  const emojis = ['🤖', '🦾', '🧠', '⚡', '🔮', '🛡️', '🌐', '🚀']
  const bg = colors[agent.agentId % colors.length]
  const emoji = emojis[agent.agentId % emojis.length]

  return (
    <div style={{
      border: '1px solid #e8e8e8', borderRadius: 10, background: '#fff',
      overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Banner */}
      <div style={{
        background: bg, height: 88,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
      }}>
        {emoji}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#191919', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            agent-{agent.agentId}.eth
          </div>
          <div style={{ fontSize: 12, color: '#acacbf', marginTop: 2, fontFamily: 'monospace' }}>
            {agent.walletAddress.slice(0, 10)}…{agent.walletAddress.slice(-4)}
          </div>
        </div>

        <ScoreStars score={agent.score} size={18} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: scoreColor(agent.score) }}>
            {scoreLabel(agent.score)}
          </span>
          <span style={{ fontSize: 12, color: '#acacbf' }}>
            {agent.interactionCount.toLocaleString()} interactions
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 40,
            background: '#f4f4f4', color: '#3d3d3d',
          }}>
            {agent.category}
          </span>
          {agent.verified && (
            <span style={{ fontSize: 11, color: '#00b67a', fontWeight: 600 }}>✓ TEE</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Best agents section ───────────────────────────────────────────────────────

function BestAgentsSection({ category }: { category: string }) {
  const catEmoji = CATEGORIES.find(c => c.name === category)?.emoji ?? ''
  const agents = [...MOCK_AGENTS]
    .filter(a => a.category === category)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  if (agents.length === 0) return null

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#191919' }}>
          {catEmoji} Best agents in <span style={{ color: '#00b67a' }}>{category}</span>
        </h2>
        <button style={{
          fontSize: 13, color: '#191919', background: 'none', border: '1px solid #dcdce6',
          borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 600,
        }}>
          See all →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {agents.map(a => <AgentCard key={a.agentId} agent={a} />)}
      </div>
    </section>
  )
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: typeof MOCK_REVIEWS[0] }) {
  const agent = MOCK_AGENTS.find(a => a.agentId === review.agentId)
  if (!agent) return null

  return (
    <div style={{
      border: '1px solid #e8e8e8', borderRadius: 10, padding: '20px',
      background: '#fff', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Reviewer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#191919',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, color: '#fff', fontWeight: 700, flexShrink: 0,
        }}>
          {review.authorName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#191919' }}>{review.authorName}</div>
          <div style={{ fontSize: 11, color: '#acacbf' }}>{review.date}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ScoreStars score={review.value} size={16} />
        </div>
      </div>

      {/* Comment */}
      <p style={{ fontSize: 13, color: '#3d3d3d', lineHeight: 1.6, margin: 0 }}>
        {review.comment}
      </p>

      {/* Agent link */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12,
        borderTop: '1px solid #f1f1f1',
      }}>
        <AgentAvatar agentId={agent.agentId} size={24} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#191919', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.ensName}
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#acacbf' }}>{agent.category}</span>
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div style={{ background: '#f7f8fa', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8', padding: '18px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap' }}>
        {[
          { value: MOCK_AGENTS.length.toString(), label: 'Registered agents' },
          { value: MOCK_AGENTS.filter(a => a.verified).length.toString(), label: 'TEE-verified' },
          { value: MOCK_REVIEWS.length.toString(), label: 'Verified feedbacks' },
          { value: '2', label: 'Chains indexed' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 24, color: '#191919' }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#acacbf', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Homepage ──────────────────────────────────────────────────────────────────

function Homepage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Agent[]>([])
  const [searched, setSearched] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim().toLowerCase()
    setSearched(true)
    setResults(MOCK_AGENTS.filter(a =>
      a.ensName.includes(q) || a.walletAddress.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) || String(a.agentId) === q
    ))
  }

  return (
    <div>
      {/* Hero — mint green background */}
      <div style={{ background: '#daf7e8', padding: '64px 24px 52px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#191919', marginBottom: 12, lineHeight: 1.1, letterSpacing: -1 }}>
            Find a trusted AI Agent
          </h1>
          <p style={{ fontSize: 16, color: '#4a5568', marginBottom: 32, lineHeight: 1.6 }}>
            Discover and verify autonomous agents — reputation scores computed in Flare TEE and signed cryptographically
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', background: '#fff', borderRadius: 8,
            border: '2px solid #191919', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ENS name, wallet address, category…"
              style={{ flex: 1, padding: '15px 20px', border: 'none', fontSize: 15, outline: 'none', color: '#191919', background: 'transparent' }}
            />
            <button type="submit" style={{
              padding: '15px 28px', background: '#191919', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>
              Search
            </button>
          </form>

          {searched && (
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              {results.length === 0
                ? <div style={{ color: '#9e9e9e', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
                    No agent found for "{search}"
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.map(a => (
                    <div key={a.agentId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', background: '#fff', borderRadius: 8,
                      border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      <AgentAvatar agentId={a.agentId} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.ensName}</div>
                        <div style={{ fontSize: 12, color: '#9e9e9e' }}>{a.category} · {a.interactionCount} interactions</div>
                      </div>
                      <ScoreStars score={a.score} size={18} />
                      <span style={{ fontWeight: 800, fontSize: 16, color: scoreColor(a.score), minWidth: 30 }}>{a.score}</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Categories */}
      <div style={{ background: '#fff', padding: '28px 0', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                background: '#f7f8fa', border: '1px solid #e8e8e8',
                borderRadius: 40, cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: 600, color: '#3d3d3d', flexShrink: 0,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#191919'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = '#191919'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f7f8fa'
                  e.currentTarget.style.color = '#3d3d3d'
                  e.currentTarget.style.borderColor = '#e8e8e8'
                }}
              >
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best agents — 4 categories */}
      <div style={{ background: '#fff', paddingTop: 48 }}>
        {FEATURED_CATEGORIES.map(cat => (
          <BestAgentsSection key={cat} category={cat} />
        ))}
      </div>

      {/* Recent reviews */}
      <div style={{ background: '#f7f8fa', borderTop: '1px solid #e8e8e8', padding: '52px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#191919' }}>Recent feedback</h2>
            <span style={{ fontSize: 13, color: '#acacbf' }}>{MOCK_REVIEWS.length} verified reviews</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {MOCK_REVIEWS.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>
        </div>
      </div>

      {/* We are TrustAgent */}
      <div style={{ background: '#191919', color: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#00b67a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
                About
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 18, letterSpacing: -0.5, lineHeight: 1.1 }}>
                We are <br /><span style={{ color: '#00b67a' }}>TrustAgent</span>
              </h2>
              <p style={{ fontSize: 15, color: '#9e9e9e', lineHeight: 1.7 }}>
                In agentic commerce, two agents that don't know each other have no way to trust each other.
                A malicious actor can create an agent, defraud, abandon it, and start fresh with a clean wallet.
                TrustAgent fixes this: every agent accumulates a score based on real interaction feedback,
                computed inside a Flare TEE and cryptographically signed — nobody can fake it.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'ERC-8004', desc: 'On-chain identity & reputation standard. Every agent gets a verifiable agentId as ERC-721.', color: '#00b67a' },
                { label: 'Flare TEE', desc: 'Score computed inside a Trusted Execution Environment. Signed with ECDSA — ecrecover-able by anyone.', color: '#2d6cdf' },
                { label: 'ENS', desc: 'Score stored as text records on agent-42.trustagent.eth. Trustless: read directly on-chain, no API needed.', color: '#9b4dca' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#242424', borderRadius: 10, padding: '16px 20px',
                  borderLeft: `3px solid ${item.color}`,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#9e9e9e', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Register tab ──────────────────────────────────────────────────────────────

function Register({ onRegistered }: { onRegistered: (agent: Agent) => void }) {
  const [wallet, setWallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ agentId: number; ensName: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentWalletAddress: wallet }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setResult({ agentId: data.agentId, ensName: data.ensName })
      onRegistered({
        agentId: data.agentId,
        ensName: data.ensName ?? `agent-${data.agentId}.trustagent.eth`,
        walletAddress: wallet,
        score: 0, reliability: 0, seniority: 0, interactionCount: 0,
        tag: '', category: 'DeFi', teeSignature: '', verified: false,
      })
      setWallet('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '64px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#191919' }}>Register an Agent</h1>
        <p style={{ color: '#6b6375', marginTop: 8, fontSize: 15 }}>
          Mint an ERC-8004 identity and create an ENS subdomain for your agent.
        </p>
      </div>

      <div style={{ border: '1px solid #e8e8e8', borderRadius: 12, padding: 28, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#3d3d3d', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Agent wallet address
          </label>
          <input
            value={wallet}
            onChange={e => setWallet(e.target.value)}
            placeholder="0x..."
            required
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: '2px solid #e8e8e8', fontSize: 15, outline: 'none',
              marginBottom: 20, boxSizing: 'border-box',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#00b67a')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e8e8e8')}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', background: '#191919', color: '#fff',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15,
            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Registering on-chain…' : 'Register Agent'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff5f5', border: '1px solid #ffd0cc', borderRadius: 8, color: '#ff3722', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: '20px', background: '#f0fdf7', border: '2px solid #00b67a', borderRadius: 10 }}>
            <div style={{ fontWeight: 700, color: '#00b67a', marginBottom: 14 }}>✓ Agent registered successfully</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <AgentAvatar agentId={result.agentId} size={48} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{result.ensName}</div>
                <div style={{ fontSize: 13, color: '#9e9e9e', marginTop: 2 }}>Agent ID #{result.agentId}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Rate tab ──────────────────────────────────────────────────────────────────

function RateAgent({ agents, onFeedback }: { agents: Agent[]; onFeedback: (agentId: number, score: number) => void }) {
  const [agentId, setAgentId] = useState('')
  const [value, setValue] = useState(80)
  const [tag, setTag] = useState('successRate')
  const [proof, setProof] = useState('')
  const [fromWallet, setFromWallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ score: number; txHash: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: Number(agentId), value, tag1: tag,
          ...(proof ? { proofOfPayment: proof, fromWalletAddress: fromWallet } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Feedback failed')
      setResult({ score: data.score, txHash: data.txHash })
      onFeedback(Number(agentId), data.score)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedAgent = agents.find(a => a.agentId === Number(agentId))

  return (
    <div style={{ maxWidth: 520, margin: '64px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#191919' }}>Rate an Agent</h1>
        <p style={{ color: '#6b6375', marginTop: 8, fontSize: 15 }}>
          Submit verified feedback after a USDC-settled interaction.
        </p>
      </div>

      <div style={{ border: '1px solid #e8e8e8', borderRadius: 12, padding: 28, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Agent select */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#3d3d3d', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Agent
            </label>
            {selectedAgent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '10px 12px', background: '#f7f8fa', borderRadius: 8 }}>
                <AgentAvatar agentId={selectedAgent.agentId} size={32} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{selectedAgent.ensName}</div>
                  <div style={{ fontSize: 11, color: '#acacbf' }}>Score: {selectedAgent.score} · {selectedAgent.category}</div>
                </div>
              </div>
            )}
            <select value={agentId} onChange={e => setAgentId(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '2px solid #e8e8e8', fontSize: 14, background: '#fff' }}>
              <option value="">Select an agent…</option>
              {agents.map(a => <option key={a.agentId} value={a.agentId}>#{a.agentId} — {a.ensName}</option>)}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#3d3d3d', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Rating: <span style={{ color: scoreColor(value), fontWeight: 800, fontSize: 16 }}>{value}/100 — {scoreLabel(value)}</span>
            </label>
            <ScoreStars score={value} size={22} />
            <input type="range" min={0} max={100} value={value}
              onChange={e => setValue(Number(e.target.value))}
              style={{ width: '100%', marginTop: 12, accentColor: scoreColor(value) }} />
          </div>

          {/* Tag */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#3d3d3d', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tag
            </label>
            <select value={tag} onChange={e => setTag(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '2px solid #e8e8e8', fontSize: 14, background: '#fff' }}>
              <option value="successRate">Success Rate</option>
              <option value="deliverySpeed">Delivery Speed</option>
              <option value="accuracy">Accuracy</option>
              <option value="reliability">Reliability</option>
            </select>
          </div>

          {/* Proof */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#3d3d3d', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Proof of Payment <span style={{ color: '#acacbf', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — USDC tx hash)</span>
            </label>
            <input value={proof} onChange={e => setProof(e.target.value)}
              placeholder="0x... USDC tx hash"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '2px solid #e8e8e8', fontSize: 14, boxSizing: 'border-box', marginBottom: proof ? 8 : 0 }} />
            {proof && (
              <input value={fromWallet} onChange={e => setFromWallet(e.target.value)}
                placeholder="0x... your wallet (buyer)" required
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '2px solid #e8e8e8', fontSize: 14, boxSizing: 'border-box' }} />
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '14px', background: '#00b67a', color: '#fff', border: 'none',
            borderRadius: 8, fontWeight: 700, fontSize: 15,
            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Submitting to Flare TEE…' : 'Submit Feedback'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff5f5', border: '1px solid #ffd0cc', borderRadius: 8, color: '#ff3722', fontSize: 13 }}>{error}</div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: '20px', background: '#f0fdf7', border: '2px solid #00b67a', borderRadius: 10 }}>
            <div style={{ fontWeight: 700, color: '#00b67a', marginBottom: 10 }}>✓ Feedback recorded on-chain</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: '#3d3d3d' }}>New composite score</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: scoreColor(result.score) }}>{result.score}</span>
            </div>
            <div style={{ fontSize: 11, color: '#acacbf', wordBreak: 'break-all', fontFamily: 'monospace' }}>tx: {result.txHash}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'register' | 'rate'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS)

  const navItems: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Explore' },
    { id: 'register', label: 'Register' },
    { id: 'rate', label: 'Rate an Agent' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e8e8e8', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 58, gap: 32 }}>
          <button onClick={() => setTab('home')} style={{
            background: 'none', border: 'none', fontWeight: 900, fontSize: 19,
            color: '#191919', letterSpacing: -0.5, cursor: 'pointer', padding: 0, flexShrink: 0,
          }}>
            <span style={{ color: '#00b67a' }}>Trust</span>Agent
          </button>
          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                padding: '7px 16px', borderRadius: 6, border: 'none', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', transition: 'background 0.1s',
                background: tab === item.id ? '#f0fdf7' : 'transparent',
                color: tab === item.id ? '#00b67a' : '#6b6375',
              }}>
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#acacbf', flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00b67a', display: 'inline-block' }} />
            Flare TEE · Live
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {tab === 'home' && <Homepage />}
        {tab === 'register' && <Register onRegistered={a => setAgents(prev => [...prev, a])} />}
        {tab === 'rate' && <RateAgent agents={agents} onFeedback={(id, score) => setAgents(prev => prev.map(a => a.agentId === id ? { ...a, score } : a))} />}
      </main>

      <footer style={{ background: '#191919', color: '#9e9e9e', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 3 }}>
              <span style={{ color: '#00b67a' }}>Trust</span>Agent
            </div>
            <div style={{ fontSize: 12 }}>Trust & reputation layer for agentic commerce</div>
          </div>
          <div style={{ fontSize: 12, display: 'flex', gap: 28 }}>
            <span>ERC-8004 · Sepolia</span>
            <span>Flare TEE · Coston2</span>
            <span>ENS · Sepolia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
