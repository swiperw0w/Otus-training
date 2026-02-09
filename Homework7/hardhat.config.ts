import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import hardhatIgnition from "@nomicfoundation/hardhat-ignition";
import "dotenv/config";

export default defineConfig({
  plugins: [
    hardhatToolboxViemPlugin,
    hardhatVerify,
    hardhatIgnition,
  ],

  solidity: {
    profiles: {
      default: { version: "0.8.33" },
      production: {
        version: "0.8.33",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    },
  },

  networks: {
    bscTestnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("BSC_RPC_URL"),
      accounts: [configVariable("BSC_PRIVATE_KEY")],
    },
    polygonAmoy: {
      type: "http",
      chainType: "l1",
      url: configVariable("POLYGON_RPC_URL"),
      accounts: [configVariable("POLYGON_PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.BSC_API_KEY || process.env.POLYGON_API_KEY || "",
    },
  }
});
