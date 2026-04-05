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
  {
    agentId: 14,
    ensName: 'agent-14.trustagent.eth',
    walletAddress: '0x6fA7b8C9d0E1f2A3b4C5d6E7f8A9b0C1d2E3f4A5',
    score: 79, reliability: 76, seniority: 83, interactionCount: 88,
    tag: 'deliverySpeed', category: 'DeFi',
    teeSignature: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
    verified: true,
  },
  {
    agentId: 20,
    ensName: 'agent-20.trustagent.eth',
    walletAddress: '0x9cD1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a6B7c8D9',
    score: 71, reliability: 68, seniority: 75, interactionCount: 52,
    tag: 'accuracy', category: 'DeFi',
    teeSignature: '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    verified: true,
  },
  {
    agentId: 22,
    ensName: 'agent-22.trustagent.eth',
    walletAddress: '0xaE2f3G4h5I6j7K8l9M0n1O2p3Q4r5S6t7U8v9W0',
    score: 63, reliability: 60, seniority: 67, interactionCount: 31,
    tag: 'successRate', category: 'DeFi',
    teeSignature: '0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    verified: false,
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
  {
    agentId: 16,
    ensName: 'agent-16.trustagent.eth',
    walletAddress: '0x7aB8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6',
    score: 82, reliability: 79, seniority: 86, interactionCount: 127,
    tag: 'successRate', category: 'Trading',
    teeSignature: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    verified: true,
  },
  {
    agentId: 24,
    ensName: 'agent-24.trustagent.eth',
    walletAddress: '0xbF9c0D1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a6B7',
    score: 74, reliability: 71, seniority: 78, interactionCount: 64,
    tag: 'accuracy', category: 'Trading',
    teeSignature: '0xf3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    verified: true,
  },
  {
    agentId: 26,
    ensName: 'agent-26.trustagent.eth',
    walletAddress: '0xcG0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f5A6b7C8',
    score: 58, reliability: 55, seniority: 62, interactionCount: 28,
    tag: 'deliverySpeed', category: 'Trading',
    teeSignature: '0xa5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    verified: false,
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
  {
    agentId: 28,
    ensName: 'agent-28.trustagent.eth',
    walletAddress: '0xdH1e2F3g4A5b6C7d8E9f0A1b2C3d4E5f6A7b8C9',
    score: 84, reliability: 82, seniority: 87, interactionCount: 192,
    tag: 'accuracy', category: 'Data Oracle',
    teeSignature: '0xb5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    verified: true,
  },
  {
    agentId: 30,
    ensName: 'agent-30.trustagent.eth',
    walletAddress: '0xeI2f3G4h5B6c7D8e9F0a1B2c3D4e5F6a7B8c9D0',
    score: 76, reliability: 73, seniority: 80, interactionCount: 97,
    tag: 'reliability', category: 'Data Oracle',
    teeSignature: '0xc6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
    verified: true,
  },
  {
    agentId: 32,
    ensName: 'agent-32.trustagent.eth',
    walletAddress: '0xfJ3g4H5i6C7d8E9f0A1b2C3d4E5f6A7b8C9d0E1',
    score: 61, reliability: 58, seniority: 65, interactionCount: 43,
    tag: 'accuracy', category: 'Data Oracle',
    teeSignature: '0xd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    verified: false,
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
  {
    agentId: 34,
    ensName: 'agent-34.trustagent.eth',
    walletAddress: '0xgK4h5I6j7D8e9F0a1B2c3D4e5F6a7B8c9D0e1F2',
    score: 77, reliability: 74, seniority: 81, interactionCount: 89,
    tag: 'deliverySpeed', category: 'NFT',
    teeSignature: '0xe8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    verified: true,
  },
  {
    agentId: 36,
    ensName: 'agent-36.trustagent.eth',
    walletAddress: '0xhL5i6J7k8E9f0A1b2C3d4E5f6A7b8C9d0E1f2A3',
    score: 69, reliability: 66, seniority: 73, interactionCount: 44,
    tag: 'accuracy', category: 'NFT',
    teeSignature: '0xf9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    verified: false,
  },
  {
    agentId: 18,
    ensName: 'agent-18.trustagent.eth',
    walletAddress: '0x8bC9d0E1f2A3b4C5d6E7f8A9b0C1d2E3f4A5b6C7',
    score: 51, reliability: 48, seniority: 55, interactionCount: 19,
    tag: 'accuracy', category: 'NFT',
    teeSignature: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
    verified: false,
  },
  // Payments
  {
    agentId: 12,
    ensName: 'agent-12.trustagent.eth',
    walletAddress: '0x5eF6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4',
    score: 89, reliability: 87, seniority: 92, interactionCount: 276,
    tag: 'accuracy', category: 'Payments',
    teeSignature: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    verified: true,
  },
  {
    agentId: 38,
    ensName: 'agent-38.trustagent.eth',
    walletAddress: '0xiM6j7K8l9F0a1B2c3D4e5F6a7B8c9D0e1F2a3B4',
    score: 80, reliability: 77, seniority: 84, interactionCount: 134,
    tag: 'deliverySpeed', category: 'Payments',
    teeSignature: '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    verified: true,
  },
  {
    agentId: 40,
    ensName: 'agent-40.trustagent.eth',
    walletAddress: '0xjN7k8L9m0G1a2B3c4D5e6F7a8B9c0D1e2F3a4B5',
    score: 66, reliability: 63, seniority: 70, interactionCount: 61,
    tag: 'successRate', category: 'Payments',
    teeSignature: '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    verified: true,
  },
  {
    agentId: 42,
    ensName: 'agent-42.trustagent.eth',
    walletAddress: '0xkO8l9M0n1H2b3C4d5E6f7A8b9C0d1E2f3A4b5C6',
    score: 48, reliability: 45, seniority: 52, interactionCount: 17,
    tag: 'accuracy', category: 'Payments',
    teeSignature: '0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    verified: false,
  },
]

export const MOCK_REVIEWS: Review[] = [
  { agentId: 3, author: '0xAlice...9B3', authorName: 'Alice.eth', value: 95, tag: 'successRate', comment: 'Executed the swap perfectly. Fast, no slippage, exactly as negotiated. Will definitely use again.', date: '2 hours ago' },
  { agentId: 5, author: '0xBob...2C4', authorName: 'Bob.eth', value: 90, tag: 'deliverySpeed', comment: 'Delivered the arbitrage signal in under 200ms. Impressive reliability across all my test runs.', date: '5 hours ago' },
  { agentId: 7, author: '0xCarol...5D7', authorName: 'Carol.eth', value: 92, tag: 'accuracy', comment: 'Price feed accurate within 0.05%. Best data oracle I\'ve used on Sepolia. TEE signature verified instantly.', date: '8 hours ago' },
  { agentId: 9, author: '0xDave...8E1', authorName: 'Dave.eth', value: 86, tag: 'successRate', comment: 'Handled the NFT batch mint flawlessly. Third interaction, consistent quality every time.', date: '1 day ago' },
  { agentId: 12, author: '0xEve...3F6', authorName: 'Eve.eth', value: 88, tag: 'accuracy', comment: 'Payment routing was perfect. Zero failed transactions across 50+ micro-payments. Solid performance.', date: '1 day ago' },
  { agentId: 28, author: '0xFrank...7A2', authorName: 'Frank.eth', value: 82, tag: 'reliability', comment: 'Uptime was 99.9% over 2 weeks. Data feeds never missed a beat during high volatility periods.', date: '2 days ago' },
  { agentId: 16, author: '0xGrace...1B9', authorName: 'Grace.eth', value: 79, tag: 'deliverySpeed', comment: 'Good execution speed, slight delay during peak hours but nothing critical. Score matches real performance.', date: '2 days ago' },
  { agentId: 38, author: '0xHank...4C5', authorName: 'Hank.eth', value: 84, tag: 'successRate', comment: 'Processed USDC cross-chain transfer in 40 seconds. Better than any bridge I\'ve tried manually.', date: '3 days ago' },
  { agentId: 3, author: '0xIris...6D8', authorName: 'Iris.eth', value: 93, tag: 'successRate', comment: 'Consistent top-tier execution. The TEE verification gave me confidence to send a higher-value transaction.', date: '3 days ago' },
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
