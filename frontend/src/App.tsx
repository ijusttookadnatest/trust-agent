import { useState, useRef, useEffect } from 'react'
import { MOCK_AGENTS, MOCK_REVIEWS, CATEGORIES, FEATURED_CATEGORIES, type Agent } from './mockData'
import './index.css'

const API = 'http://localhost:3000'

const COMPANY_LOGOS = [
  { name: 'Stripe',    domain: 'stripe.com' },
  { name: 'Shopify',  domain: 'shopify.com' },
  { name: 'Coinbase', domain: 'coinbase.com' },
  { name: 'Binance',  domain: 'binance.com' },
  { name: 'Uniswap',  domain: 'uniswap.org' },
  { name: 'Aave',     domain: 'aave.com' },
  { name: 'Chainlink',domain: 'chain.link' },
  { name: 'OpenSea',  domain: 'opensea.io' },
  { name: 'Alchemy',  domain: 'alchemy.com' },
  { name: 'Polygon',  domain: 'polygon.technology' },
  { name: 'Arbitrum', domain: 'arbitrum.io' },
  { name: 'Optimism', domain: 'optimism.io' },
  { name: 'Lido',     domain: 'lido.fi' },
  { name: 'Curve',    domain: 'curve.fi' },
  { name: 'dYdX',     domain: 'dydx.exchange' },
  { name: 'Circle',   domain: 'circle.com' },
]

// ── Agent name mapping ────────────────────────────────────────────────────────

const AGENT_NAMES = [
  'Nexus', 'Orion', 'Cipher', 'Echo', 'Phantom', 'Apex', 'Vector', 'Zenith',
  'Pulse', 'Aurora', 'Forge', 'Helix', 'Nova', 'Quasar', 'Rift', 'Specter',
  'Titan', 'Warden', 'Vortex', 'Prism',
]

function agentName(agentId: number) {
  return AGENT_NAMES[agentId % AGENT_NAMES.length]
}

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return '#00b67a'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
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
          background: i <= filled ? scoreColor(score) : '#2a2a2a',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

// ── TrustAgent logo ───────────────────────────────────────────────────────────

function TrustAgentLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.18,
        background: '#00b67a', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="white">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
      </div>
      <span style={{ fontWeight: 800, fontSize: size * 0.65, color: '#fff', letterSpacing: -0.5, lineHeight: 1 }}>
        TrustAgent
      </span>
    </div>
  )
}

// ── Provider trust banner ─────────────────────────────────────────────────────

const FAKE_PROVIDERS = [
  { name: 'NEXUS·AI',     style: { fontWeight: 800, letterSpacing: 2, fontSize: 13 } },
  { name: 'OmegaTrade',   style: { fontWeight: 700, letterSpacing: -0.5, fontSize: 15 } },
  { name: 'pulse.swap',   style: { fontWeight: 400, letterSpacing: 0, fontSize: 14, fontStyle: 'italic' as const } },
  { name: 'AuraFi',       style: { fontWeight: 800, letterSpacing: -1, fontSize: 16 } },
  { name: 'VECTOR',       style: { fontWeight: 900, letterSpacing: 3, fontSize: 12 } },
  { name: 'zenith',       style: { fontWeight: 300, letterSpacing: 1, fontSize: 16 } },
  { name: 'ApexOracle',   style: { fontWeight: 700, letterSpacing: -0.5, fontSize: 14 } },
  { name: 'ForgeDAO',     style: { fontWeight: 800, letterSpacing: 0, fontSize: 15 } },
  { name: 'helix·swap',   style: { fontWeight: 400, letterSpacing: 1, fontSize: 13 } },
  { name: 'PRISM LABS',   style: { fontWeight: 700, letterSpacing: 2, fontSize: 12 } },
]

function ProviderBanner() {
  return (
    <div style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#333', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 }}>
          Trusted by leading agent providers
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
          {FAKE_PROVIDERS.map(p => (
            <span key={p.name} style={{ color: '#3a3a3a', transition: 'color 0.15s', cursor: 'default', ...p.style }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#3a3a3a' }}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentAvatar({ agentId, size = 72 }: { agentId: number; size?: number }) {
  const colors = ['#00b67a', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#06b6d4', '#eab308', '#8b5cf6']
  const emojis = ['🤖', '🦾', '🧠', '⚡', '🔮', '🛡️', '🌐', '🚀']
  const bg = colors[agentId % colors.length]
  const emoji = emojis[agentId % emojis.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 40 ? 10 : '50%',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.45, flexShrink: 0,
    }}>
      {emoji}
    </div>
  )
}

// ── Agent card ────────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const company = COMPANY_LOGOS[agent.agentId % COMPANY_LOGOS.length]

  return (
    <div style={{
      border: '1px solid #1f1f1f', borderRadius: 10, background: '#0d0d0d',
      overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a3a' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f' }}
    >
      <div style={{
        background: '#141414', height: 76, borderBottom: '1px solid #1f1f1f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img
            src={`https://logo.clearbit.com/${company.domain}`}
            alt={company.name}
            style={{ width: 32, height: 32, objectFit: 'contain' }}
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = `<span style="font-size:13px;font-weight:700;color:#000">${company.name.slice(0, 2).toUpperCase()}</span>`
            }}
          />
        </div>
      </div>

      <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agentName(agent.agentId)}
          </div>
          <div style={{ fontSize: 11, color: '#525252', marginTop: 2, fontFamily: 'monospace' }}>
            {agent.walletAddress.slice(0, 10)}…{agent.walletAddress.slice(-4)}
          </div>
        </div>

        <ScoreStars score={agent.score} size={16} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor(agent.score) }}>
            {scoreLabel(agent.score)}
          </span>
          <span style={{ fontSize: 11, color: '#525252' }}>
            {agent.interactionCount.toLocaleString()} txs
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 40,
            background: '#141414', border: '1px solid #2a2a2a', color: '#a3a3a3',
          }}>
            {agent.category}
          </span>
          {agent.verified && (
            <span style={{ fontSize: 10, color: '#00b67a', fontWeight: 700 }}>✓ TEE</span>
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
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 52px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>
          {catEmoji} Best in <span style={{ color: '#a3a3a3' }}>{category}</span>
        </h2>
        <button style={{
          fontSize: 12, color: '#a3a3a3', background: 'none', border: '1px solid #1f1f1f',
          borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontWeight: 500,
          transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#a3a3a3' }}
        >
          See all →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
      border: '1px solid #1f1f1f', borderRadius: 10, padding: '18px',
      background: '#0d0d0d', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: '#1f1f1f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0,
          border: '1px solid #2a2a2a',
        }}>
          {review.authorName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{review.authorName}</div>
          <div style={{ fontSize: 11, color: '#525252' }}>{review.date}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ScoreStars score={review.value} size={14} />
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#a3a3a3', lineHeight: 1.6, margin: 0 }}>
        {review.comment}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10,
        borderTop: '1px solid #1a1a1a',
      }}>
        <AgentAvatar agentId={agent.agentId} size={22} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agentName(agent.agentId)}
          </div>
        </div>
        <span style={{ fontSize: 10, color: '#525252' }}>{agent.category}</span>
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div style={{ borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f', padding: '16px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap' }}>
        {[
          { value: MOCK_AGENTS.length.toString(), label: 'Registered agents' },
          { value: MOCK_AGENTS.filter(a => a.verified).length.toString(), label: 'TEE-verified' },
          { value: MOCK_REVIEWS.length.toString(), label: 'Verified feedbacks' },
          { value: '2', label: 'Chains indexed' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#525252', marginTop: 2 }}>{stat.label}</div>
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
      {/* Hero */}
      <div style={{
        padding: '80px 24px 64px', textAlign: 'center',
        background: 'radial-gradient(ellipse 90% 60% at 50% -5%, #0f2d5c 0%, #060d1f 55%, #000 80%)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: '#525252', textTransform: 'uppercase', marginBottom: 20 }}>
            Reputation layer for agentic commerce
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#fff', marginBottom: 14, lineHeight: 1.1, letterSpacing: -1.5 }}>
            Find a trusted<br />
            <span style={{ color: '#00b67a' }}>AI Agent</span>
          </h1>
          <p style={{ fontSize: 15, color: '#525252', marginBottom: 36, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
            Reputation scores computed inside a Flare TEE and signed cryptographically — verifiable on-chain via ENS, no API required.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', background: '#0d0d0d', borderRadius: 8,
            border: '1px solid #2a2a2a', overflow: 'hidden',
          }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ENS name, wallet address, category…"
              style={{
                flex: 1, padding: '14px 18px', border: 'none', fontSize: 14, outline: 'none',
                color: '#fff', background: 'transparent', borderRadius: 0,
              }}
            />
            <button type="submit" style={{
              padding: '14px 24px', background: '#fff', color: '#000',
              border: 'none', fontWeight: 600, fontSize: 14, flexShrink: 0,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Search
            </button>
          </form>

          {searched && (
            <div style={{ marginTop: 12, textAlign: 'left' }}>
              {results.length === 0
                ? <div style={{ color: '#525252', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                    No agent found for "{search}"
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {results.map(a => (
                    <div key={a.agentId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', background: '#0d0d0d', borderRadius: 8,
                      border: '1px solid #1f1f1f',
                    }}>
                      <AgentAvatar agentId={a.agentId} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{agentName(a.agentId)}</div>
                        <div style={{ fontSize: 11, color: '#525252' }}>{a.category} · {a.interactionCount} txs</div>
                      </div>
                      <ScoreStars score={a.score} size={16} />
                      <span style={{ fontWeight: 700, fontSize: 15, color: scoreColor(a.score), minWidth: 28 }}>{a.score}</span>
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

      {/* Provider trust banner */}
      <ProviderBanner />

      {/* Categories */}
      <div style={{ borderBottom: '1px solid #1f1f1f', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: '#0d0d0d', border: '1px solid #1f1f1f',
                borderRadius: 40, cursor: 'pointer',
                fontSize: 14, fontWeight: 500, color: '#a3a3a3',
                transition: 'border-color 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#a3a3a3' }}
              >
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best agents */}
      <div style={{ paddingTop: 48 }}>
        {FEATURED_CATEGORIES.map(cat => (
          <BestAgentsSection key={cat} category={cat} />
        ))}
      </div>

      {/* Recent reviews */}
      <div style={{ borderTop: '1px solid #1f1f1f', padding: '52px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>Recent feedback</h2>
            <span style={{ fontSize: 12, color: '#525252' }}>{MOCK_REVIEWS.length} verified</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {MOCK_REVIEWS.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>
        </div>
      </div>

      {/* We are TrustAgent */}
      <div style={{ borderTop: '1px solid #1f1f1f', padding: '72px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#525252', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
                About
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, letterSpacing: -1, lineHeight: 1.1, color: '#fff' }}>
                We are<br /><span style={{ color: '#00b67a' }}>TrustAgent</span>
              </h2>
              <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.8 }}>
                In agentic commerce, two agents that don't know each other have no way to trust each other.
                A malicious actor can create an agent, defraud, abandon it, and start fresh with a clean wallet.
                TrustAgent fixes this: every agent accumulates a score based on real interaction feedback,
                computed inside a Flare TEE and cryptographically signed — nobody can fake it.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'ERC-8004', desc: 'On-chain identity & reputation standard. Every agent gets a verifiable agentId as ERC-721.', color: '#00b67a' },
                { label: 'Flare TEE', desc: 'Score computed inside a Trusted Execution Environment. Signed with ECDSA — ecrecover-able by anyone.', color: '#3b82f6' },
                { label: 'ENS', desc: 'Score stored as text records on agent-42.trustagent.eth. Trustless: read directly on-chain, no API needed.', color: '#a855f7' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#0d0d0d', borderRadius: 8, padding: '14px 16px',
                  borderLeft: `2px solid ${item.color}`, border: `1px solid #1f1f1f`,
                  borderLeftColor: item.color,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#525252', lineHeight: 1.6 }}>{item.desc}</div>
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
    <div style={{ maxWidth: 480, margin: '64px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>Register an Agent</h1>
        <p style={{ color: '#525252', marginTop: 8, fontSize: 14 }}>
          Mint an ERC-8004 identity and create an ENS subdomain for your agent.
        </p>
      </div>

      <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 24, background: '#0d0d0d' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Agent wallet address
          </label>
          <input
            value={wallet}
            onChange={e => setWallet(e.target.value)}
            placeholder="0x..."
            required
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 6,
              border: '1px solid #2a2a2a', fontSize: 14, marginBottom: 16,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#525252')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#fff', color: '#000',
            border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14,
            opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e5e5e5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            {loading ? 'Registering on-chain…' : 'Register Agent'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 14, padding: '11px 14px', background: '#1a0000', border: '1px solid #3a1010', borderRadius: 6, color: '#ef4444', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, padding: '16px', background: '#001a0f', border: '1px solid #00b67a33', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, color: '#00b67a', marginBottom: 12, fontSize: 13 }}>✓ Agent registered</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <AgentAvatar agentId={result.agentId} size={44} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{result.ensName}</div>
                <div style={{ fontSize: 12, color: '#525252', marginTop: 2 }}>Agent ID #{result.agentId}</div>
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
    <div style={{ maxWidth: 480, margin: '64px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>Rate an Agent</h1>
        <p style={{ color: '#525252', marginTop: 8, fontSize: 14 }}>
          Submit verified feedback after a USDC-settled interaction.
        </p>
      </div>

      <div style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 24, background: '#0d0d0d' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Agent
            </label>
            {selectedAgent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '9px 12px', background: '#141414', borderRadius: 6, border: '1px solid #1f1f1f' }}>
                <AgentAvatar agentId={selectedAgent.agentId} size={28} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#fff' }}>{selectedAgent.ensName}</div>
                  <div style={{ fontSize: 11, color: '#525252' }}>Score: {selectedAgent.score} · {selectedAgent.category}</div>
                </div>
              </div>
            )}
            <select value={agentId} onChange={e => setAgentId(e.target.value)} required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid #2a2a2a', fontSize: 13 }}>
              <option value="">Select an agent…</option>
              {agents.map(a => <option key={a.agentId} value={a.agentId}>#{a.agentId} — {a.ensName}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Rating: <span style={{ color: scoreColor(value) }}>{value}/100 — {scoreLabel(value)}</span>
            </label>
            <ScoreStars score={value} size={20} />
            <input type="range" min={0} max={100} value={value}
              onChange={e => setValue(Number(e.target.value))}
              style={{ width: '100%', marginTop: 10, accentColor: scoreColor(value), background: 'transparent', border: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Tag
            </label>
            <select value={tag} onChange={e => setTag(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid #2a2a2a', fontSize: 13 }}>
              <option value="successRate">Success Rate</option>
              <option value="deliverySpeed">Delivery Speed</option>
              <option value="accuracy">Accuracy</option>
              <option value="reliability">Reliability</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Proof of Payment <span style={{ color: '#525252', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input value={proof} onChange={e => setProof(e.target.value)}
              placeholder="0x... USDC tx hash"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid #2a2a2a', fontSize: 13, marginBottom: proof ? 8 : 0 }} />
            {proof && (
              <input value={fromWallet} onChange={e => setFromWallet(e.target.value)}
                placeholder="0x... your wallet (buyer)" required
                style={{ width: '100%', padding: '11px 14px', borderRadius: 6, border: '1px solid #2a2a2a', fontSize: 13 }} />
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '12px', background: '#00b67a', color: '#fff', border: 'none',
            borderRadius: 6, fontWeight: 600, fontSize: 14,
            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}>
            {loading ? 'Submitting to Flare TEE…' : 'Submit Feedback'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 14, padding: '11px 14px', background: '#1a0000', border: '1px solid #3a1010', borderRadius: 6, color: '#ef4444', fontSize: 13 }}>{error}</div>
        )}

        {result && (
          <div style={{ marginTop: 16, padding: '16px', background: '#001a0f', border: '1px solid #00b67a33', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, color: '#00b67a', marginBottom: 10, fontSize: 13 }}>✓ Feedback recorded on-chain</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: '#a3a3a3' }}>New composite score</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: scoreColor(result.score) }}>{result.score}</span>
            </div>
            <div style={{ fontSize: 11, color: '#525252', wordBreak: 'break-all', fontFamily: 'monospace' }}>tx: {result.txHash}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Agent Provider dropdown ───────────────────────────────────────────────────

function AgentProviderDropdown({ onRegister }: { onRegister: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '7px 14px', background: open ? '#fff' : 'transparent', color: open ? '#000' : '#a3a3a3',
          border: '1px solid', borderColor: open ? '#fff' : '#2a2a2a',
          borderRadius: 6, fontWeight: 500, fontSize: 13,
          cursor: 'pointer', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#fff' } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#a3a3a3' } }}
      >
        For agent providers
        <span style={{ fontSize: 9, marginTop: 1 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8,
          padding: 6, minWidth: 200, zIndex: 200,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          <button
            onClick={() => { setOpen(false); onRegister() }}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 12px',
              background: 'none', border: 'none', borderRadius: 6,
              color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 2,
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#141414' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            <span>Register an agent</span>
            <span style={{ fontSize: 11, color: '#525252', fontWeight: 400 }}>Mint ERC-8004 identity + ENS subdomain</span>
          </button>

          <div style={{ height: 1, background: '#1a1a1a', margin: '4px 0' }} />

          <button
            onClick={() => setOpen(false)}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 12px',
              background: 'none', border: 'none', borderRadius: 6,
              color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 2,
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#141414' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            <span>Create an account</span>
            <span style={{ fontSize: 11, color: '#525252', fontWeight: 400 }}>Manage all your registered agents</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'register' | 'rate'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1a1a1a', background: '#000', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 54, gap: 28 }}>
          <button onClick={() => setTab('home')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
          }}>
            <TrustAgentLogo size={32} />
          </button>

          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            {([
              { id: 'home' as Tab, label: 'Explore' },
              { id: 'rate' as Tab, label: 'Rate an Agent' },
            ]).map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13,
                fontWeight: 500, cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
                background: tab === item.id ? '#141414' : 'transparent',
                color: tab === item.id ? '#fff' : '#525252',
              }}>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#525252', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b67a', display: 'inline-block' }} />
              Flare TEE
            </div>
            <AgentProviderDropdown onRegister={() => setTab('register')} />
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {tab === 'home' && <Homepage />}
        {tab === 'register' && <Register onRegistered={a => setAgents(prev => [...prev, a])} />}
        {tab === 'rate' && <RateAgent agents={agents} onFeedback={(id, score) => setAgents(prev => prev.map(a => a.agentId === id ? { ...a, score } : a))} />}
      </main>

      <footer style={{ borderTop: '1px solid #1a1a1a', color: '#525252', padding: '24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ marginBottom: 4 }}>
              <TrustAgentLogo size={22} />
            </div>
            <div style={{ fontSize: 12 }}>Trust & reputation layer for agentic commerce</div>
          </div>
          <div style={{ fontSize: 12, display: 'flex', gap: 24 }}>
            <span>ERC-8004 · Sepolia</span>
            <span>Flare TEE · Coston2</span>
            <span>ENS · Sepolia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
