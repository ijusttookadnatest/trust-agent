import { ethers } from 'ethers'
import { getReputationRegistry } from './contracts.js'

export type ScoreResult = {
  score: number
  reliability: number
  seniority: number
  interactionCount: number
  teeSignature: string
  teeAttestation: string
}

const INSTRUCTION_SENDER_ABI = [
  'function sign(bytes calldata _message) external payable returns (bytes32)',
]

function getCoston2Signer() {
  const rpcUrl = process.env.COSTON2_RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc'
  const privateKey = process.env.COSTON2_PRIVATE_KEY || process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('COSTON2_PRIVATE_KEY or PRIVATE_KEY not set')
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  // Strip leading 0x if present (fce-sign uses no-prefix, backend uses 0x-prefix)
  const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  return new ethers.Wallet(key, provider)
}

async function computeScoreViaTEE(
  walletAddress: string,
  agentId: number,
): Promise<{ score: number; reliability: number; seniority: number; signature: string }> {
  const instructionSenderAddress = process.env.INSTRUCTION_SENDER
  if (!instructionSenderAddress) throw new Error('INSTRUCTION_SENDER not set')

  const signer = getCoston2Signer()
  const sender = new ethers.Contract(instructionSenderAddress, INSTRUCTION_SENDER_ABI, signer)

  const payload = ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'uint256'],
    [walletAddress, agentId],
  )

  const feeWei = BigInt(process.env.FEE_WEI || '1000000000000')

  console.log(`[TEE] sending computeScore for agentId=${agentId} wallet=${walletAddress}`)
  const tx = await sender.sign(ethers.getBytes(payload), { value: feeWei })
  const receipt = await tx.wait()
  if (!receipt) throw new Error('No receipt')
  if (receipt.logs.length === 0 || receipt.logs[0].topics.length < 3) {
    throw new Error('Could not extract instruction ID from receipt')
  }
  const instructionId: string = receipt.logs[0].topics[2]
  console.log(`[TEE] instruction sent: ${instructionId}`)

  const proxyUrl = process.env.TEE_PROXY_URL || 'http://localhost:6676'
  return await pollTEEResult(proxyUrl, instructionId)
}

async function pollTEEResult(
  proxyUrl: string,
  instructionId: string,
  maxAttempts = 30,
): Promise<{ score: number; reliability: number; seniority: number; signature: string }> {
  const id = instructionId.startsWith('0x') ? instructionId : `0x${instructionId}`
  const url = `${proxyUrl}/action/result/${id}`

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const json = (await res.json()) as { result?: { status: number; data: string } }
        if (json.result?.status === 1) {
          const dataHex = json.result.data.startsWith('0x')
            ? json.result.data.slice(2)
            : json.result.data
          const scoreData = JSON.parse(Buffer.from(dataHex, 'hex').toString('utf-8'))
          console.log(`[TEE] result: score=${scoreData.score} reliability=${scoreData.reliability} seniority=${scoreData.seniority}`)
          return scoreData
        }
        if (json.result?.status === 0) {
          throw new Error(`TEE returned error status for instruction ${id}`)
        }
      }
    } catch (e: any) {
      if (e.message?.startsWith('TEE returned')) throw e
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error(`TEE result timeout after ${maxAttempts * 2}s for instruction ${id}`)
}

export async function computeScore(agentId: number, walletAddress?: string): Promise<ScoreResult> {
  // If TEE is configured, delegate entirely to it (independent on-chain verification + signing)
  if (process.env.INSTRUCTION_SENDER && walletAddress) {
    const teeResult = await computeScoreViaTEE(walletAddress, agentId)
    return {
      score: teeResult.score,
      reliability: teeResult.reliability,
      seniority: teeResult.seniority,
      interactionCount: 0, // TEE doesn't expose this separately
      teeSignature: teeResult.signature,
      teeAttestation: '0xTEE_LOCAL_MODE', // real attestation available in prod TEE
    }
  }

  // Fallback: compute locally (no TEE signature)
  const registry = getReputationRegistry()
  const clients: string[] = [...(await registry.getClients(agentId))]
  const { count, avgValue } = await registry.getSummary(agentId, clients)

  const interactionCount = Number(count)
  const rawAvg = Number(avgValue)
  const reliability = Math.min(100, Math.max(0, rawAvg > 100 ? Math.round(rawAvg / 100) : rawAvg))
  const seniority = Math.min(100, Math.round(Math.sqrt(interactionCount) * 15))
  const score = Math.round(reliability * 0.6 + seniority * 0.4)

  return { score, reliability, seniority, interactionCount, teeSignature: '0xSTUB', teeAttestation: '0xSTUB' }
}
