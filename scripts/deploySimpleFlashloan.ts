import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

import SimpleFlashloanArtifact from "../artifacts/contracts/SimpleFlashloan.sol/SimpleFlashloan.json";

dotenv.config();

if (!process.env.SEPOLIA_RPC_URL || !process.env.SEPOLIA_PRIVATE_KEY) {
  throw new Error("Missing env vars");
}

const account = privateKeyToAccount(
  process.env.SEPOLIA_PRIVATE_KEY as `0x${string}`
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

// Aave v3 PoolAddressesProvider (Sepolia)
const ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

async function main() {
  const hash = await walletClient.deployContract({
    abi: SimpleFlashloanArtifact.abi,
    bytecode: SimpleFlashloanArtifact.bytecode as `0x${string}`,
    args: [ADDRESSES_PROVIDER],
  });

  console.log("Deploy tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("SimpleFlashloan deployed to:", receipt.contractAddress);
}

main();
