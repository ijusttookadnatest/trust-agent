export type Agent = {
  agentId: number
  ensName: string
  walletAddress: string
  score: number
  reliability: number
  seniority: number
  interactionCount: number
  tag: string
  category: string
  teeSignature: string
  verified: boolean
}

export type Review = {
  agentId: number
  author: string
  authorName: string
  value: number
  tag: string
  comment: string
  date: string
}

export const MOCK_AGENTS: Agent[] = [
  // DeFi
  {
    agentId: 3,
    ensName: 'agent-3.trustagent.eth',
    walletAddress: '0x1aB2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0',
    score: 94, reliability: 97, seniority: 89, interactionCount: 214,
    tag: 'successRate', category: 'DeFi',
    teeSignature: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    verified: true,
  },
  // Trading
  {
    agentId: 5,
    ensName: 'agent-5.trustagent.eth',
    walletAddress: '0x2bC3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1',
    score: 88, reliability: 85, seniority: 92, interactionCount: 341,
    tag: 'deliverySpeed', category: 'Trading',
    teeSignature: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    verified: true,
  },
  // Data Oracle
  {
    agentId: 7,
    ensName: 'agent-7.trustagent.eth',
    walletAddress: '0x3cD4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2',
    score: 91, reliability: 89, seniority: 94, interactionCount: 503,
    tag: 'accuracy', category: 'Data Oracle',
    teeSignature: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    verified: true,
  },
  // NFT
  {
    agentId: 9,
    ensName: 'agent-9.trustagent.eth',
    walletAddress: '0x4dE5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2E3',
    score: 86, reliability: 83, seniority: 90, interactionCount: 157,
    tag: 'successRate', category: 'NFT',
    teeSignature: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    verified: true,
  },
  // Payments
  {
    agentId: 41,
    ensName: 'agent-41.trustagent.eth',
    walletAddress: '0x5eF6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4',
    score: 89, reliability: 87, seniority: 92, interactionCount: 276,
    tag: 'accuracy', category: 'Payments',
    teeSignature: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    verified: true,
  },
  {
    agentId: 43,
    ensName: 'agent-43.trustagent.eth',
    walletAddress: '0x6aB3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1',
    score: 80, reliability: 77, seniority: 84, interactionCount: 134,
    tag: 'deliverySpeed', category: 'Payments',
    teeSignature: '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    verified: true,
  },
  // Data Oracle extras
  {
    agentId: 33,
    ensName: 'agent-33.trustagent.eth',
    walletAddress: '0xfJ3g4H5i6C7d8E9f0A1b2C3d4E5f6A7b8C9d0E1',
    score: 61, reliability: 58, seniority: 65, interactionCount: 43,
    tag: 'accuracy', category: 'Data Oracle',
    teeSignature: '0xd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    verified: false,
  },
  // NFT extras
  {
    agentId: 35,
    ensName: 'agent-35.trustagent.eth',
    walletAddress: '0xgK4h5I6j7D8e9F0a1B2c3D4e5F6a7B8c9D0e1F2',
    score: 77, reliability: 74, seniority: 81, interactionCount: 89,
    tag: 'deliverySpeed', category: 'NFT',
    teeSignature: '0xe8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    verified: true,
  },
  // Trading extras
  {
    agentId: 37,
    ensName: 'agent-37.trustagent.eth',
    walletAddress: '0xhL5i6J7k8E9f0A1b2C3d4E5f6A7b8C9d0E1f2A3',
    score: 74, reliability: 71, seniority: 78, interactionCount: 64,
    tag: 'accuracy', category: 'Trading',
    teeSignature: '0xf3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    verified: true,
  },
  // DeFi extras
  {
    agentId: 39,
    ensName: 'agent-39.trustagent.eth',
    walletAddress: '0x9cD1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a6B7c8D9',
    score: 71, reliability: 68, seniority: 75, interactionCount: 52,
    tag: 'accuracy', category: 'DeFi',
    teeSignature: '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    verified: true,
  },
  {
    agentId: 101,
    ensName: 'agent-darkpool.trustagent.eth',
    walletAddress: '0xA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0',
    score: 83, reliability: 81, seniority: 86, interactionCount: 178,
    tag: 'successRate', category: 'DeFi',
    teeSignature: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    verified: true,
  },
  {
    agentId: 102,
    ensName: 'agent-rekt0r.trustagent.eth',
    walletAddress: '0xB2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1',
    score: 58, reliability: 54, seniority: 63, interactionCount: 29,
    tag: 'accuracy', category: 'DeFi',
    teeSignature: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    verified: false,
  },
  // Trading extras
  {
    agentId: 103,
    ensName: 'agent-sandwich69.trustagent.eth',
    walletAddress: '0xC3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2',
    score: 77, reliability: 74, seniority: 81, interactionCount: 112,
    tag: 'deliverySpeed', category: 'Trading',
    teeSignature: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    verified: true,
  },
  {
    agentId: 104,
    ensName: 'agent-alphadegen.trustagent.eth',
    walletAddress: '0xD4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3',
    score: 65, reliability: 61, seniority: 70, interactionCount: 47,
    tag: 'successRate', category: 'Trading',
    teeSignature: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    verified: true,
  },
  // Data Oracle extras
  {
    agentId: 105,
    ensName: 'agent-omniscient.trustagent.eth',
    walletAddress: '0xE5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2E3f4',
    score: 96, reliability: 98, seniority: 93, interactionCount: 721,
    tag: 'accuracy', category: 'Data Oracle',
    teeSignature: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    verified: true,
  },
  {
    agentId: 106,
    ensName: 'agent-feedmaster.trustagent.eth',
    walletAddress: '0xF6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5',
    score: 72, reliability: 70, seniority: 75, interactionCount: 83,
    tag: 'reliability', category: 'Data Oracle',
    teeSignature: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
    verified: true,
  },
  // Payments extras
  {
    agentId: 107,
    ensName: 'agent-usdcmaxi.trustagent.eth',
    walletAddress: '0xA7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2E3f4A5b6',
    score: 91, reliability: 89, seniority: 94, interactionCount: 438,
    tag: 'accuracy', category: 'Payments',
    teeSignature: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    verified: true,
  },
  {
    agentId: 108,
    ensName: 'agent-gasless.trustagent.eth',
    walletAddress: '0xB8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7',
    score: 55, reliability: 52, seniority: 59, interactionCount: 22,
    tag: 'deliverySpeed', category: 'Payments',
    teeSignature: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
    verified: false,
  },
]

export const MOCK_REVIEWS: Review[] = [
  { agentId: 3, author: '0xF4a9...3C1', authorName: 'yield-hunter.eth', value: 95, tag: 'successRate', comment: 'Executed the swap perfectly. Fast, no slippage, exactly as negotiated. Will definitely use again.', date: '2 hours ago' },
  { agentId: 5, author: '0xB2e7...8A0', authorName: 'arb-sentinel.eth', value: 90, tag: 'deliverySpeed', comment: 'Delivered the arbitrage signal in under 200ms. Impressive reliability across all my test runs.', date: '5 hours ago' },
  { agentId: 7, author: '0xC9d1...5F4', authorName: 'quant-zero.eth', value: 92, tag: 'accuracy', comment: 'Price feed accurate within 0.05%. Best data oracle I\'ve used on Sepolia. TEE signature verified instantly.', date: '8 hours ago' },
  { agentId: 9, author: '0xE3b5...2D9', authorName: 'flash-alpha.eth', value: 86, tag: 'successRate', comment: 'Handled the NFT batch mint flawlessly. Third interaction, consistent quality every time.', date: '1 day ago' },
  { agentId: 41, author: '0xA7f2...6E3', authorName: 'mev-catcher.eth', value: 88, tag: 'accuracy', comment: 'Payment routing was perfect. Zero failed transactions across 50+ micro-payments. Solid performance.', date: '1 day ago' },
  { agentId: 37, author: '0x19e4...7F2', authorName: 'degen-bot.eth', value: 79, tag: 'deliverySpeed', comment: 'Good execution speed, slight delay during peak hours but nothing critical. Score matches real performance.', date: '2 days ago' },
  { agentId: 43, author: '0x6aB3...4C8', authorName: 'cross-chain-x.eth', value: 84, tag: 'successRate', comment: 'Processed USDC cross-chain transfer in 40 seconds. Better than any bridge I\'ve tried manually.', date: '3 days ago' },
  { agentId: 3, author: '0x2dF9...0A5', authorName: 'alpha-seeker.eth', value: 93, tag: 'successRate', comment: 'Consistent top-tier execution. The TEE verification gave me confidence to send a higher-value transaction.', date: '3 days ago' },
  { agentId: 33, author: '0xD5c8...1B7', authorName: 'sniper-v3.eth', value: 82, tag: 'reliability', comment: 'Uptime was 99.9% over 2 weeks. Data feeds never missed a beat during high volatility periods.', date: '2 days ago' },
]

export const CATEGORIES = [
  { name: 'DeFi', emoji: '⚡' },
  { name: 'Trading', emoji: '📈' },
  { name: 'Data Oracle', emoji: '🔮' },
  { name: 'NFT', emoji: '🎨' },
  { name: 'Payments', emoji: '💸' },
  { name: 'Bridging', emoji: '🌉' },
  { name: 'Governance', emoji: '🗳️' },
  { name: 'Security', emoji: '🛡️' },
]

export const FEATURED_CATEGORIES = ['DeFi', 'Trading', 'Data Oracle', 'Payments']
