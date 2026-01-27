import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

import EthUsdOracleArtifact from "../artifacts/contracts/EthUsdOracle.sol/EthUsdOracle.json";

dotenv.config();

console.log("ENV KEYS:", Object.keys(process.env));
console.log("PRIVATE_KEY =", process.env.PRIVATE_KEY);
console.log("RPC_URL =", process.env.SEPOLIA_RPC_URL);

if (!process.env.PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL) {
  throw new Error("Missing env vars");
}

const account = privateKeyToAccount(
  process.env.PRIVATE_KEY as `0x${string}`
);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL),
});

const PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

async function main() {
  const hash = await walletClient.deployContract({
    abi: EthUsdOracleArtifact.abi,
    bytecode: EthUsdOracleArtifact.bytecode as `0x${string}`,
    args: [PRICE_FEED],
  });

  console.log("Deploy tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("EthUsdOracle deployed to:", receipt.contractAddress);
}

main();
