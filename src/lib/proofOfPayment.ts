import { ethers } from 'ethers'

const USDC_CONTRACT = process.env.USDC_CONTRACT_ADDRESS!
const ERC20_ABI = ['function transfer(address to, uint256 amount)']

function getProvider() {
  return new ethers.JsonRpcProvider(process.env.RPC_URL!)
}

export type VerifyResult = { valid: boolean; error?: string }

export async function verifyProofOfPayment(
  txHash: string,
  fromWalletAddress: string,
  toWalletAddress: string,
): Promise<VerifyResult> {
  const tx = await getProvider().getTransaction(txHash)
  if (!tx) return { valid: false, error: 'transaction not found' }

  if (tx.to?.toLowerCase() !== USDC_CONTRACT.toLowerCase())
    return { valid: false, error: 'tx is not a USDC transfer' }

  if (tx.from.toLowerCase() !== fromWalletAddress.toLowerCase())
    return { valid: false, error: 'tx sender does not match fromWalletAddress' }

  const iface = new ethers.Interface(ERC20_ABI)
  let recipient: string
  try {
    const decoded = iface.parseTransaction({ data: tx.data })
    recipient = decoded!.args[0] as string
  } catch {
    return { valid: false, error: 'failed to decode tx data as ERC-20 transfer' }
  }

  if (recipient.toLowerCase() !== toWalletAddress.toLowerCase())
    return { valid: false, error: 'tx recipient does not match agent wallet' }

  return { valid: true }
}
