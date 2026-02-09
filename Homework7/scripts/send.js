import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const BSC_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
const BSC_BRIDGE = "0x62Ff4d0cE34EA33B5c7b358eaA25C55dbbD9017f";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const publicClient = createPublicClient({
  transport: http(BSC_RPC),
});

const walletClient = createWalletClient({
  account,
  transport: http(BSC_RPC),
});

const abi = [
  {
    name: "send",
    type: "function",
    stateMutability: "payable",
    inputs: [{ type: "uint256" }],
    outputs: [],
  },
];

async function main() {
  const hash = await walletClient.writeContract({
    address: BSC_BRIDGE,
    abi,
    functionName: "send",
    args: [parseEther("10")],
  });

  console.log("Send tx:", hash);
  await publicClient.waitForTransactionReceipt({ hash });

  console.log("Tokens burned & message sent");
}

main().catch(console.error);
