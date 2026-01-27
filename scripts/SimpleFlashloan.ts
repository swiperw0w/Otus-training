import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { simpleFlashloanAbi } from "../abi/SimpleFlashloan.js";


dotenv.config();

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});

const contractAddress = "0x..."; // адрес SimpleFlashloan

await walletClient.writeContract({
  address: contractAddress,
  abi: simpleFlashloanAbi,
  functionName: "requestFlashloan",
  args: [0xWETH_ADDRESS, 1_000_000_000_000_000n],
});

const balance = await publicClient.getBalance({
  address: account.address,
});

console.log("Balance (wei):", balance);
console.log("Balance (ETH):", Number(balance) / 1e18);

const gasPrice = await publicClient.getGasPrice();
console.log("Gas price:", gasPrice);

const hash = await walletClient.sendTransaction({
  to: "0xRECEIVER_ADDRESS",
  value: 1000000000000000n, // 0.001 ETH
});

console.log("Tx hash:", hash);

