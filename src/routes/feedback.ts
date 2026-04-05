import { Router } from 'express'
import type { Request, Response, IRouter } from 'express'
import { getReputationRegistry } from '../lib/contracts.js'
import { agentsDb, txHashDb } from '../lib/db.js'
import { setTrustRecords } from '../lib/ens.js'
import { computeScore } from '../lib/score.js'
import { verifyProofOfPayment } from '../lib/proofOfPayment.js'

export const feedbackRouter: IRouter = Router()

feedbackRouter.post('/', async (req: Request, res: Response) => {
  const { agentId, value, tag1, proofOfPayment, fromWalletAddress } = req.body
  console.log(`[feedback] POST /feedback agentId=${agentId} value=${value} tag=${tag1} proof=${proofOfPayment ?? 'none'}`)

  if (agentId === undefined || value === undefined || !tag1) {
    res.status(400).json({ error: 'agentId, value, and tag1 are required' })
    return
  }
  if (value < 0 || value > 100) {
    res.status(400).json({ error: 'value must be between 0 and 100' })
    return
  }

  const agentRow = agentsDb.findByAgentId(agentId)
  if (!agentRow) {
    console.error(`[feedback] agentId ${agentId} not found in DB`)
    res.status(404).json({ error: `agentId ${agentId} not registered` })
    return
  }
  console.log(`[feedback] agent found: wallet=${agentRow.walletAddress} ensName=${agentRow.ensName}`)

  // proofOfPayment verification
  if (proofOfPayment) {
    if (!fromWalletAddress) {
      res.status(400).json({ error: 'fromWalletAddress is required when proofOfPayment is provided' })
      return
    }
    if (txHashDb.isUsed(proofOfPayment)) {
      res.status(409).json({ error: 'proofOfPayment already used' })
      return
    }
    const verify = await verifyProofOfPayment(proofOfPayment, fromWalletAddress, agentRow.walletAddress)
    if (!verify.valid) {
      res.status(400).json({ error: `invalid proofOfPayment: ${verify.error}` })
      return
    }
    txHashDb.markUsed(proofOfPayment)
  }

  // Record feedback on-chain
  console.log(`[feedback] sending giveFeedback tx on Sepolia…`)
  let txHash: string
  try {
    const registry = getReputationRegistry()
    const tx = await registry.giveFeedback(agentId, value, 0, tag1)
    console.log(`[feedback] tx sent: ${tx.hash} — waiting for confirmation…`)
    const receipt = await tx.wait()
    txHash = receipt!.hash
    console.log(`[feedback] tx confirmed in block ${receipt?.blockNumber} → ${txHash}`)
  } catch (err: any) {
    console.error(`[feedback] giveFeedback failed: ${err.message}`)
    res.status(500).json({ error: `giveFeedback failed: ${err.message}` })
    return
  }

  // Recompute score + update ENS
  console.log(`[feedback] computing score via TEE / fallback…`)
  let scoreResult
  try {
    scoreResult = await computeScore(agentId, agentRow.walletAddress)
    console.log(`[feedback] score result: score=${scoreResult.score} reliability=${scoreResult.reliability} seniority=${scoreResult.seniority}`)
    if (agentRow.ensName) {
      console.log(`[feedback] updating ENS ${agentRow.ensName} score=${scoreResult.score}`)
      await setTrustRecords(agentRow.ensName, {
        score: scoreResult.score,
        walletAddress: agentRow.walletAddress,
        teeSignature: scoreResult.teeSignature,
        teeAttestation: scoreResult.teeAttestation,
      })
    }
  } catch (err: any) {
    console.error(`[feedback] score/ENS update failed: ${err.message}`)
    res.status(207).json({ txHash, warning: `score/ENS update failed: ${err.message}` })
    return
  }

  console.log(`[feedback] done → score=${scoreResult.score} txHash=${txHash}`)
  res.status(200).json({
    txHash,
    score: scoreResult.score,
    reliability: scoreResult.reliability,
    seniority: scoreResult.seniority,
    interactionCount: scoreResult.interactionCount,
  })
})
