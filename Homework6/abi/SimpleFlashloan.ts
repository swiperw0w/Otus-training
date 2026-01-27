export const simpleFlashloanAbi = [
  {
    type: "function",
    name: "requestFlashloan",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
] as const;
