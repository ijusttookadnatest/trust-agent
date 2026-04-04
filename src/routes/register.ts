import { Router } from 'express'
import type { Request, Response, IRouter } from 'express'
import { getIdentityRegistry } from '../lib/contracts.js'
import { resolveAgentId } from '../lib/resolveAgentId.js'
import { agentsDb } from '../lib/db.js'
import { registerEnsSubname, setTrustRecords } from '../lib/ens.js'

export const registerRouter: IRouter = Router()

registerRouter.post('/', async (req: Request, res: Response) => {
  const { agentWalletAddress, chain = 'sepolia' } = req.body

  if (!agentWalletAddress) {
    res.status(400).json({ error: 'agentWalletAddress is required' })
    return
  }

  // idempotent — si déjà enregistré sur cette chain
  const existing = resolveAgentId(agentWalletAddress, chain)
  if (existing !== null) {
    const row = agentsDb.findByWalletAndChain(agentWalletAddress, chain)

    // ENS avait échoué au premier essai — on retry uniquement ENS
    if (!row?.ensName) {
      try {
        const ensName = await registerEnsSubname(existing, agentWalletAddress)
        await setTrustRecords(ensName, {
          score: 0,
          walletAddress: agentWalletAddress,
        })
        agentsDb.updateEnsName(agentWalletAddress, ensName)
        res.status(200).json({ agentId: existing, ensName, chain, registeredAt: row?.registeredAt, alreadyRegistered: true })
      } catch (ensErr: any) {
        res.status(207).json({ agentId: existing, ensName: null, chain, registeredAt: row?.registeredAt, alreadyRegistered: true, warning: `ENS retry failed: ${ensErr.message}` })
      }
      return
    }

    res.status(200).json({ agentId: existing, ensName: row.ensName, chain, registeredAt: row.registeredAt, alreadyRegistered: true })
    return
  }

  // Mint ERC-8004
  let agentId: number
  try {
    const identityRegistry = getIdentityRegistry()
    const tx = await identityRegistry.register()
    const receipt = await tx.wait()

    let found: number | null = null
    for (const log of receipt!.logs) {
      const parsed = identityRegistry.interface.parseLog({ topics: log.topics as string[], data: log.data })
      if (parsed?.name === 'Registered') {
        found = Number(parsed.args.agentId)
        break
      }
    }
    if (found === null) throw new Error('Registered event not found')
    agentId = found
  } catch (err: any) {
    res.status(500).json({ error: `ERC-8004 registration failed: ${err.message}` })
    return
  }

  // ENS — non bloquant
  let ensName: string | null = null
  let ensWarning: string | undefined

  try {
    ensName = await registerEnsSubname(agentId, agentWalletAddress)
    await setTrustRecords(ensName, {
      score: 0,
      walletAddress: agentWalletAddress,
    })
  } catch (ensErr: any) {
    ensWarning = `ENS failed: ${ensErr.message} — call /register again to retry`
  }

  agentsDb.insert({ walletAddress: agentWalletAddress, agentId, chain, ensName })

  const row = agentsDb.findByWalletAndChain(agentWalletAddress, chain)
  res.status(ensWarning ? 207 : 201).json({
    agentId,
    ensName,
    chain,
    registeredAt: row?.registeredAt,
    alreadyRegistered: false,
    ...(ensWarning ? { warning: ensWarning } : {}),
  })
})
