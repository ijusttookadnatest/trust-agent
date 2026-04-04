/** Extension configuration constants. */

export const VERSION = "0.1.0";

/** OPType and OPCommand constants — must match the bytes32 constants in InstructionSender.sol. */
export const OP_TYPE_KEY = "KEY";
export const OP_COMMAND_UPDATE = "UPDATE";
export const OP_COMMAND_COMPUTE = "SIGN";

export const SEPOLIA_RPC = "https://eth-sepolia.g.alchemy.com/v2/Algct2BayZW95mBW38Dp2";
export const REPUTATION_REGISTRY = "0x3752b33ADeaF2883395803000eCb1418EEaea458" as const;
