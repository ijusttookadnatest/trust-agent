import { ethers } from 'ethers'

const IDENTITY_REGISTRY_ABI = [
  'function register() external returns (uint256)',
  'function setAgentURI(uint256 agentId, string uri) external',
  'event Registered(uint256 indexed agentId, address indexed owner)',
]

const REPUTATION_REGISTRY_ABI = [
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1) external',
  'function getSummary(uint256 agentId, address[] clientAddresses) external view returns (uint64 count, int128 avgValue)',
  'function getClients(uint256 agentId) external view returns (address[])',
]

function getSigner() {
  const rpcUrl = process.env.RPC_URL
  const privateKey = process.env.PRIVATE_KEY
  if (!rpcUrl) throw new Error('RPC_URL not set')
  if (!privateKey) throw new Error('PRIVATE_KEY not set')
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  return new ethers.Wallet(privateKey, provider)
}

export function getIdentityRegistry() {
  const address = process.env.IDENTITY_REGISTRY_ADDRESS
  if (!address) throw new Error('IDENTITY_REGISTRY_ADDRESS not set')
  return new ethers.Contract(address, IDENTITY_REGISTRY_ABI, getSigner())
}

export function getReputationRegistry() {
  const address = process.env.REPUTATION_REGISTRY_ADDRESS
  if (!address) throw new Error('REPUTATION_REGISTRY_ADDRESS not set')
  return new ethers.Contract(address, REPUTATION_REGISTRY_ABI, getSigner())
}
