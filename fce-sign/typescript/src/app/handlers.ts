/** Handler functions for the KEY extension operations. */

import http from "node:http";
import { encodeAbiParameters, decodeAbiParameters, encodeFunctionData, decodeFunctionResult } from "viem";
import { Framework } from "../base/types.js";
import { VERSION, OP_TYPE_KEY, OP_COMMAND_UPDATE, OP_COMMAND_COMPUTE, SEPOLIA_RPC, REPUTATION_REGISTRY } from "./config.js";
import { signECDSA, parsePrivateKey } from "./crypto.js";
import { hexToBytes, bytesToHex } from "../base/encoding.js";

/** Mutable state — the framework serializes all handler calls. */
let privateKey: Uint8Array | null = null;
let signPort = "9090";

const REPUTATION_ABI = [
  {
    name: "getClients",
    type: "function" as const,
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view" as const,
  },
  {
    name: "getSummary",
    type: "function" as const,
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddresses", type: "address[]" },
    ],
    outputs: [
      { name: "count", type: "uint64" },
      { name: "avgValue", type: "int128" },
    ],
    stateMutability: "view" as const,
  },
] as const;

/** Set the sign port for communicating with the TEE node. */
export function setSignPort(port: string): void {
  signPort = port;
}

/** Register the KEY handlers with the framework. */
export function register(framework: Framework): void {
  framework.handle(OP_TYPE_KEY, OP_COMMAND_UPDATE, handleKeyUpdate);
  framework.handle(OP_TYPE_KEY, OP_COMMAND_COMPUTE, handleScoreCompute);
}

/** Return a JSON-serializable snapshot of the current state. */
export function reportState(): unknown {
  return { hasKey: privateKey !== null, version: VERSION };
}

/** Reset state (for testing). */
export function resetState(): void {
  privateKey = null;
}

async function handleKeyUpdate(
  msg: string
): Promise<[string | null, number, string | null]> {
  if (!msg) return [null, 0, "originalMessage is empty"];

  let ciphertext: Uint8Array;
  try {
    ciphertext = hexToBytes(msg);
  } catch (e) {
    return [null, 0, `invalid hex in originalMessage: ${e}`];
  }

  let keyBytes: Uint8Array;
  try {
    keyBytes = await decryptViaNode(ciphertext);
  } catch (e) {
    return [null, 0, `decryption failed: ${e}`];
  }

  let validatedKey: Uint8Array;
  try {
    validatedKey = parsePrivateKey(keyBytes);
  } catch (e) {
    return [null, 0, `invalid private key: ${e}`];
  }

  privateKey = validatedKey;
  console.log("private key updated");
  return [null, 1, null];
}

async function handleScoreCompute(
  msg: string
): Promise<[string | null, number, string | null]> {
  if (privateKey === null) return [null, 0, "no signing key stored"];
  if (!msg) return [null, 0, "originalMessage is empty"];

  // Decode abi.encode(walletAddress, agentId) sent from InstructionSender.computeScore()
  let walletAddress: `0x${string}`;
  let agentId: bigint;
  try {
    const hexMsg = (msg.startsWith("0x") ? msg : `0x${msg}`) as `0x${string}`;
    [walletAddress, agentId] = decodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      hexMsg
    );
  } catch (e) {
    return [null, 0, `failed to decode message: ${e}`];
  }

  // Fetch all addresses that gave feedback to this agent
  let clients: readonly `0x${string}`[];
  try {
    clients = await getClients(agentId);
  } catch (e) {
    return [null, 0, `getClients RPC call failed: ${e}`];
  }

  if (clients.length === 0) {
    const result = JSON.stringify({ score: 0, reliability: 0, seniority: 0, walletAddress, signature: "0x" });
    return [bytesToHex(Buffer.from(result)), 1, null];
  }

  // Fetch aggregated count + average feedback value
  let count: bigint;
  let avgValue: bigint;
  try {
    ({ count, avgValue } = await getSummary(agentId, clients));
  } catch (e) {
    return [null, 0, `getSummary RPC call failed: ${e}`];
  }

  // reliability comes from on-chain feedback average (clamped to [0, 100])
  const reliability = Math.max(0, Math.min(100, Number(avgValue)));

  const seniority = calculateSeniority(count);

  const score = Math.round(reliability * 0.6 + seniority * 0.4);

  // Sign abi.encode(walletAddress, score) — verifiable via ecrecover against TEE public key
  const payload = encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }],
    [walletAddress, BigInt(score)]
  );

  let sig: Uint8Array;
  try {
    sig = signECDSA(privateKey, hexToBytes(payload));
  } catch (e) {
    return [null, 0, `signing failed: ${e}`];
  }

  const result = JSON.stringify({
    score,
    reliability,
    seniority,
    walletAddress,
    signature: bytesToHex(sig),
  });

  return [bytesToHex(Buffer.from(result)), 1, null];
}

function calculateSeniority(count: bigint): number {
  // logarithmic growth: plateaus around 1000 interactions
  // count=0 → 0, count=1 → ~10, count=10 → ~30, count=100 → ~67, count=1000 → 100
  return Math.min(100, Math.round(Math.log(Number(count) + 1) / Math.log(1001) * 100));
}

async function getClients(agentId: bigint): Promise<readonly `0x${string}`[]> {
  const data = encodeFunctionData({ abi: REPUTATION_ABI, functionName: "getClients", args: [agentId] });
  const raw = await ethCall(SEPOLIA_RPC, REPUTATION_REGISTRY, data);
  const clients = decodeFunctionResult({ abi: REPUTATION_ABI, functionName: "getClients", data: raw });
  return clients as unknown as readonly `0x${string}`[];
}

async function getSummary(
  agentId: bigint,
  clientAddresses: readonly `0x${string}`[]
): Promise<{ count: bigint; avgValue: bigint }> {
  const data = encodeFunctionData({ abi: REPUTATION_ABI, functionName: "getSummary", args: [agentId, clientAddresses] });
  const raw = await ethCall(SEPOLIA_RPC, REPUTATION_REGISTRY, data);
  const [count, avgValue] = decodeFunctionResult({ abi: REPUTATION_ABI, functionName: "getSummary", data: raw }) as [bigint, bigint];
  return { count, avgValue };
}

async function ethCall(rpcUrl: string, to: string, data: string): Promise<`0x${string}`> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data }, "latest"],
      id: 1,
    }),
  });
  const json = (await response.json()) as { result?: string; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  if (!json.result) throw new Error(`RPC returned no result for call to ${to}`);
  return json.result as `0x${string}`;
}

function decryptViaNode(ciphertext: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${signPort}/decrypt`;
    const body = JSON.stringify({ encryptedMessage: Buffer.from(ciphertext).toString("base64") });

    const req = http.request(
      url,
      { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const data = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode !== 200) { reject(new Error(`node returned ${res.statusCode}: ${data}`)); return; }
          try {
            const parsed = JSON.parse(data);
            resolve(new Uint8Array(Buffer.from(parsed.decryptedMessage, "base64")));
          } catch (e) {
            reject(new Error(`decode response: ${e}`));
          }
        });
      }
    );

    req.on("error", (e) => reject(new Error(`request error: ${e.message}`)));
    req.write(body);
    req.end();
  });
}
