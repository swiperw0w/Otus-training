import {
  createWalletClient,
  http,
  parseEther
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const BSC_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
const BSC_BRIDGE = "0x62Ff4d0cE34EA33B5c7b358eaA25C55dbbD9017f";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const client = createWalletClient({
  account,
  transport: http(BSC_RPC),
});

const abi = [
  {
    name: "faucet",
    type: "function",
    inputs: [{ type: "uint256" }],
    outputs: [],
  },
];

async function main() {
  await client.writeContract({
    address: BSC_BRIDGE,
    abi,
    functionName: "faucet",
    args: [parseEther("100")],
  });

  console.log("Faucet: 100 BT minted on BSC");
}

main().catch(console.error);
