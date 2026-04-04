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
    res.status(404).json({ error: `agentId ${agentId} not registered` })
    return
  }

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
  console.log(`[feedback] giveFeedback agentId=${agentId} value=${value} tag=${tag1}`)
  let txHash: string
  try {
    const registry = getReputationRegistry()
    const tx = await registry.giveFeedback(agentId, value, 0, tag1)
    const receipt = await tx.wait()
    txHash = receipt!.hash
    console.log(`[feedback] giveFeedback tx=${txHash}`)
  } catch (err: any) {
    res.status(500).json({ error: `giveFeedback failed: ${err.message}` })
    return
  }

  // Recompute score + update ENS
  let scoreResult
  try {
    scoreResult = await computeScore(agentId, agentRow.walletAddress)
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
    // Non-blocking — feedback is recorded on-chain, ENS update failed
    res.status(207).json({ txHash, warning: `score/ENS update failed: ${err.message}` })
    return
  }

  res.status(200).json({
    txHash,
    score: scoreResult.score,
    reliability: scoreResult.reliability,
    seniority: scoreResult.seniority,
    interactionCount: scoreResult.interactionCount,
  })
})
