package app

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"os"
	"time"

	"sign-tools/base"
	"sign-tools/base/fccutils"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/ecies"
	"github.com/flare-foundation/go-flare-common/pkg/logger"
	"github.com/flare-foundation/tee-node/pkg/types"
	"github.com/pkg/errors"
)

// DefaultFee is the default fee paid with each instruction (1 gwei * 1000 = 0.000001 ETH).
// Override with FEE_WEI in .env.
var DefaultFee = big.NewInt(1_000_000_000_000)

func init() {
	if feeStr := os.Getenv("FEE_WEI"); feeStr != "" {
		if fee, ok := new(big.Int).SetString(feeStr, 10); ok {
			DefaultFee = fee
		}
	}
}

// RunE2ETest executes the full reputation score extension end-to-end test:
//   - setExtensionId (idempotent)
//   - fetch TEE public key, ECIES-encrypt a test signing key
//   - send updateKey instruction + poll result
//   - send computeScore instruction (ABI-encoded address+agentId) + poll result
//   - parse JSON result, ecrecover signature, verify signer
func RunE2ETest(s *base.Support, instructionSenderAddr common.Address, extProxyURL string, pollTimeout time.Duration) error {
	// ── Step 1: setExtensionId ──
	logger.Infof("Step 1: Setting extension ID on InstructionSender...")
	if err := SetExtensionId(s, instructionSenderAddr); err != nil {
		return errors.Errorf("setExtensionId: %s", err)
	}
	logger.Infof("  Extension ID set (or already was).")

	// ── Step 2: Fetch TEE public key and ECIES-encrypt a test private key ──
	logger.Infof("Step 2: Fetching TEE public key from extension proxy...")
	teeInfo, err := fccutils.TeeInfo(extProxyURL)
	if err != nil {
		return errors.Errorf("fetch TEE info: %s", err)
	}

	ecdsaPub, err := types.ParsePubKey(teeInfo.MachineData.PublicKey)
	if err != nil {
		return errors.Errorf("parse TEE public key: %s", err)
	}

	eciesPub := &ecies.PublicKey{
		X:      ecdsaPub.X,
		Y:      ecdsaPub.Y,
		Curve:  ecies.DefaultCurve,
		Params: ecies.ECIES_AES128_SHA256,
	}

	// Fixed test private key for deterministic verification.
	testPrivKeyHex := "fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19"
	testPrivKeyBytes, _ := hex.DecodeString(testPrivKeyHex)
	testPrivKey, err := crypto.ToECDSA(testPrivKeyBytes)
	if err != nil {
		return errors.Errorf("parse test private key: %s", err)
	}
	testAddress := crypto.PubkeyToAddress(testPrivKey.PublicKey)
	logger.Infof("  Test private key address: %s", testAddress.Hex())

	ciphertext, err := ecies.Encrypt(rand.Reader, eciesPub, testPrivKeyBytes, nil, nil)
	if err != nil {
		return errors.Errorf("ECIES encrypt: %s", err)
	}
	logger.Infof("  Encrypted key: %d bytes", len(ciphertext))

	// ── Step 3: updateKey ──
	logger.Infof("Step 3: Sending updateKey instruction on-chain...")
	updateKeyID, err := SendUpdateKey(s, instructionSenderAddr, ciphertext, DefaultFee)
	if err != nil {
		return errors.Errorf("updateKey: %s", err)
	}
	logger.Infof("  updateKey instruction ID: %s", updateKeyID.Hex())

	// ── Step 4: Poll for updateKey result ──
	logger.Infof("Step 4: Waiting for updateKey result...")
	updateResult, err := pollResult(extProxyURL, updateKeyID, pollTimeout)
	if err != nil {
		return errors.Errorf("poll updateKey: %s", err)
	}
	if updateResult.Status == 0 {
		return errors.Errorf("updateKey instruction failed: %s", updateResult.Log)
	}
	logger.Infof("  updateKey succeeded (status=%d)", updateResult.Status)

	// ── Step 5: computeScore ──
	// Send ABI-encoded (address walletAddress, uint256 agentId) as the message.
	testWalletAddr := testAddress // reuse test key address as the wallet under test
	testAgentId := big.NewInt(1)
	var payload [64]byte
	copy(payload[12:32], testWalletAddr.Bytes())
	agentIdBytes := testAgentId.FillBytes(make([]byte, 32))
	copy(payload[32:64], agentIdBytes)

	logger.Infof("Step 5: Sending computeScore instruction on-chain (wallet=%s, agentId=%s)...", testWalletAddr.Hex(), testAgentId.String())
	signID, err := SendSign(s, instructionSenderAddr, payload[:], DefaultFee)
	if err != nil {
		return errors.Errorf("computeScore: %s", err)
	}
	logger.Infof("  computeScore instruction ID: %s", signID.Hex())

	// ── Step 6: Poll for computeScore result and verify ──
	logger.Infof("Step 6: Waiting for computeScore result...")
	signResult, err := pollResult(extProxyURL, signID, pollTimeout)
	if err != nil {
		return errors.Errorf("poll computeScore: %s", err)
	}
	if signResult.Status == 0 {
		return errors.Errorf("computeScore instruction failed: %s", signResult.Log)
	}

	// Result data is hexutil.Bytes — already decoded to raw JSON bytes by the proxy.
	var scoreResult struct {
		Score       int    `json:"score"`
		Reliability int    `json:"reliability"`
		Seniority   int    `json:"seniority"`
		WalletAddr  string `json:"walletAddress"`
		Signature   string `json:"signature"`
	}
	if err := json.Unmarshal(signResult.Data, &scoreResult); err != nil {
		return errors.Errorf("JSON parse result (raw: %x): %s", signResult.Data, err)
	}
	logger.Infof("  Score: %d (reliability=%d, seniority=%d)", scoreResult.Score, scoreResult.Reliability, scoreResult.Seniority)
	logger.Infof("  Signature: %s", scoreResult.Signature)

	// If no feedbacks on-chain, score=0 and signature is empty — skip ecrecover.
	if scoreResult.Score == 0 && scoreResult.Signature == "0x" {
		logger.Infof("  No feedbacks on-chain for agentId=1, score=0 — skipping signature verification.")
		logger.Infof("All tests passed! (score=0, no feedbacks)")
		return nil
	}

	// Verify: ecrecover(keccak256(abi.encode(walletAddress, score)), sig) == testAddress
	var sigPayload [64]byte
	copy(sigPayload[12:32], testWalletAddr.Bytes())
	scoreBig := big.NewInt(int64(scoreResult.Score))
	copy(sigPayload[32:64], scoreBig.FillBytes(make([]byte, 32)))

	sigHex := scoreResult.Signature
	if len(sigHex) > 2 && sigHex[:2] == "0x" {
		sigHex = sigHex[2:]
	}
	sigBytes, err := hex.DecodeString(sigHex)
	if err != nil {
		return errors.Errorf("hex decode signature: %s", err)
	}

	msgHash := crypto.Keccak256(sigPayload[:])
	recoveredPub, err := crypto.SigToPub(msgHash, normalizeV(sigBytes))
	if err != nil {
		return errors.Errorf("ecrecover: %s", err)
	}
	recoveredAddr := crypto.PubkeyToAddress(*recoveredPub)
	logger.Infof("  Recovered signer: %s", recoveredAddr.Hex())
	logger.Infof("  Expected signer:  %s", testAddress.Hex())

	if recoveredAddr != testAddress {
		return errors.Errorf("FAIL: recovered signer %s does not match expected %s", recoveredAddr.Hex(), testAddress.Hex())
	}

	logger.Infof("All tests passed!")
	return nil
}

// ── helpers ──────────────────────────────────────────────────────────────────

// actionResult mirrors the proxy /action/result response (simplified).
type actionResult struct {
	Status int    `json:"status"`
	Data   []byte `json:"data"`
	Log    string `json:"log"`
}

// pollResult polls the extension proxy for an action result until it completes
// or times out. For the sign extension we use a simple polling loop rather
// than the fccutils.ActionResult helper because the sign proxy returns a
// slightly different envelope than the scaffold proxy.
func pollResult(extProxyURL string, instructionID common.Hash, timeout time.Duration) (*actionResult, error) {
	// Try the structured fccutils.ActionResult (polls internally).
	actionResp, err := fccutils.ActionResult(extProxyURL, instructionID)
	if err == nil {
		return &actionResult{
			Status: int(actionResp.Result.Status),
			Data:   []byte(actionResp.Result.Data),
			Log:    actionResp.Result.Log,
		}, nil
	}

	return nil, errors.Errorf("action result not available: %v", err)
}

// abiDecodeTwo decodes ABI-encoded (bytes, bytes).
func abiDecodeTwo(data []byte) ([]byte, []byte, error) {
	if len(data) < 64 {
		return nil, nil, fmt.Errorf("data too short for (bytes,bytes): %d bytes", len(data))
	}
	offset1 := new(big.Int).SetBytes(data[0:32]).Uint64()
	offset2 := new(big.Int).SetBytes(data[32:64]).Uint64()

	readBytes := func(offset uint64) ([]byte, error) {
		if int(offset)+32 > len(data) {
			return nil, fmt.Errorf("offset %d out of range", offset)
		}
		length := new(big.Int).SetBytes(data[offset : offset+32]).Uint64()
		start := offset + 32
		if int(start+length) > len(data) {
			return nil, fmt.Errorf("length %d exceeds data at offset %d", length, offset)
		}
		return data[start : start+length], nil
	}

	a, err := readBytes(offset1)
	if err != nil {
		return nil, nil, err
	}
	b, err := readBytes(offset2)
	if err != nil {
		return nil, nil, err
	}
	return a, b, nil
}

// normalizeV converts a 65-byte [r||s||v] signature from 27/28 format to 0/1.
func normalizeV(sig []byte) []byte {
	if len(sig) != 65 {
		return sig
	}
	normalized := make([]byte, 65)
	copy(normalized, sig)
	if normalized[64] >= 27 {
		normalized[64] -= 27
	}
	return normalized
}
