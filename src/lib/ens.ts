import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, sepolia } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { createSubname, setRecords } from '@ensdomains/ensjs/wallet'
import { getResolver } from '@ensdomains/ensjs/public'

const ENS_CHAIN = process.env.ENS_CHAIN === 'mainnet' ? mainnet : sepolia
const ENS_RPC_URL = process.env.ENS_RPC_URL ?? process.env.RPC_URL!
const ENS_PARENT_NAME = process.env.ENS_PARENT_NAME! // ex: "trustlayer.eth"

function getWalletClient() {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  return createWalletClient({
    chain: addEnsContracts(ENS_CHAIN),
    transport: http(ENS_RPC_URL),
    account,
  })
}

function getPublicClient() {
  return createPublicClient({
    chain: addEnsContracts(ENS_CHAIN),
    transport: http(ENS_RPC_URL),
  })
}

export async function registerEnsSubname(agentId: number, ownerAddress: string): Promise<string> {
  const walletClient = getWalletClient()
  const publicClient = getPublicClient()
  const ensName = `agent-${agentId}.${ENS_PARENT_NAME}`

  // Récupère le resolver du nom parent pour le configurer sur le subdomain
  const resolverAddress = await getResolver(publicClient, { name: ENS_PARENT_NAME })
  if (!resolverAddress) throw new Error(`No resolver found for parent name ${ENS_PARENT_NAME}`)

  // Owner = notre wallet pour pouvoir signer les updates de score
  // L'adresse de l'agent est dans les text records (eth-address)
  const hash = await createSubname(walletClient, {
    name: ensName,
    owner: walletClient.account.address,
    contract: 'registry',
    resolverAddress,
  })

  // Attendre la confirmation avant de pouvoir écrire les text records
  await publicClient.waitForTransactionReceipt({ hash })

  return ensName
}

export async function setTrustRecords(ensName: string, records: {
  score: number
  walletAddress: string
  teeSignature?: string
  teeAttestation?: string
}) {
  const walletClient = getWalletClient()
  const publicClient = getPublicClient()

  const resolverAddress = await getResolver(publicClient, { name: ensName })
  if (!resolverAddress) throw new Error(`No resolver found for ${ensName}`)

  await setRecords(walletClient, {
    name: ensName,
    resolverAddress,
    texts: [
      { key: 'trust-score',   value: String(records.score) },
      { key: 'eth-address',   value: records.walletAddress },
      { key: 'last-updated',  value: String(Math.floor(Date.now() / 1000)) },
      ...(records.teeSignature   ? [{ key: 'tee-signature',   value: records.teeSignature }]   : []),
      ...(records.teeAttestation ? [{ key: 'tee-attestation', value: records.teeAttestation }] : []),
    ],
  })
}
