import { Router } from 'express'
import type { Request, Response, IRouter } from 'express'
import { getIdentityRegistry } from '../lib/contracts.js'
import { resolveAgentId } from '../lib/resolveAgentId.js'
import { agentsDb } from '../lib/db.js'
import { registerEnsSubname, setTrustRecords } from '../lib/ens.js'

export const registerRouter: IRouter = Router()

registerRouter.post('/', async (req: Request, res: Response) => {
  const { agentWalletAddress, chain = 'sepolia' } = req.body
  console.log(`[register] POST /register wallet=${agentWalletAddress} chain=${chain}`)

  if (!agentWalletAddress) {
    res.status(400).json({ error: 'agentWalletAddress is required' })
    return
  }

  // idempotent — si déjà enregistré sur cette chain
  const existing = resolveAgentId(agentWalletAddress, chain)
  if (existing !== null) {
    const row = agentsDb.findByWalletAndChain(agentWalletAddress, chain)
    console.log(`[register] already registered → agentId=${existing} ensName=${row?.ensName}`)

    // ENS avait échoué au premier essai — on retry uniquement ENS
    if (!row?.ensName) {
      console.log(`[register] ENS missing, retrying…`)
      try {
        const ensName = await registerEnsSubname(existing, agentWalletAddress)
        await setTrustRecords(ensName, { score: 0, walletAddress: agentWalletAddress })
        agentsDb.updateEnsName(agentWalletAddress, ensName)
        console.log(`[register] ENS retry OK → ${ensName}`)
        res.status(200).json({ agentId: existing, ensName, chain, registeredAt: row?.registeredAt, alreadyRegistered: true })
      } catch (ensErr: any) {
        console.error(`[register] ENS retry failed: ${ensErr.message}`)
        res.status(207).json({ agentId: existing, ensName: null, chain, registeredAt: row?.registeredAt, alreadyRegistered: true, warning: `ENS retry failed: ${ensErr.message}` })
      }
      return
    }

    res.status(200).json({ agentId: existing, ensName: row.ensName, chain, registeredAt: row.registeredAt, alreadyRegistered: true })
    return
  }

  // Mint ERC-8004
  console.log(`[register] minting ERC-8004 identity on Sepolia…`)
  let agentId: number
  try {
    const identityRegistry = getIdentityRegistry()
    const tx = await identityRegistry.register()
    console.log(`[register] tx sent: ${tx.hash} — waiting for confirmation…`)
    const receipt = await tx.wait()
    console.log(`[register] tx confirmed in block ${receipt?.blockNumber}`)

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
    console.log(`[register] ERC-8004 agentId=${agentId}`)
  } catch (err: any) {
    console.error(`[register] ERC-8004 mint failed: ${err.message}`)
    res.status(500).json({ error: `ERC-8004 registration failed: ${err.message}` })
    return
  }

  // ENS — non bloquant
  let ensName: string | null = null
  let ensWarning: string | undefined

  console.log(`[register] creating ENS subdomain agent-${agentId}.reputagent.eth…`)
  try {
    ensName = await registerEnsSubname(agentId, agentWalletAddress)
    await setTrustRecords(ensName, { score: 0, walletAddress: agentWalletAddress })
    console.log(`[register] ENS OK → ${ensName}`)
  } catch (ensErr: any) {
    ensWarning = `ENS failed: ${ensErr.message} — call /register again to retry`
    console.error(`[register] ENS failed: ${ensErr.message}`)
  }

  agentsDb.insert({ walletAddress: agentWalletAddress, agentId, chain, ensName })
  console.log(`[register] saved to DB`)

  const row = agentsDb.findByWalletAndChain(agentWalletAddress, chain)
  console.log(`[register] done → agentId=${agentId} ensName=${ensName} warning=${ensWarning ?? 'none'}`)
  res.status(ensWarning ? 207 : 201).json({
    agentId,
    ensName,
    chain,
    registeredAt: row?.registeredAt,
    alreadyRegistered: false,
    ...(ensWarning ? { warning: ensWarning } : {}),
  })
})
