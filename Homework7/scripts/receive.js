import "dotenv/config";
import { createWalletClient, http, encodeAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

// Polygon Amoy bridge
const BRIDGE_ADDRESS = "0x0e364e98A2dBB22992B6B08E70831D0Ca7a4Bd24";

const RECEIVER = "0x8605C4E90FA2FD77846bF434fF9D020Fe370798a";

const AMOUNT = 10n * 10n ** 18n;

const ABI = [
  {
    name: "receiveMessage",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "payload", type: "bytes" }
    ],
    outputs: [],
  },
];

async function main() {
  const account = privateKeyToAccount(
    process.env.PRIVATE_KEY.startsWith("0x")
      ? process.env.PRIVATE_KEY
      : `0x${process.env.PRIVATE_KEY}`
  );

  const client = createWalletClient({
    account,
    chain: polygonAmoy,
    transport: http(process.env.POLYGON_RPC),
  });

  // payload = abi.encode(address, uint256)
  const payload = encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
    ],
    [RECEIVER, AMOUNT]
  );

  const txHash = await client.writeContract({
    address: BRIDGE_ADDRESS,
    abi: ABI,
    functionName: "receiveMessage",
    args: [payload],
  });

  console.log("receiveMessage tx sent:", txHash);
  console.log("Cross-chain payload processed (DEMO)");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
