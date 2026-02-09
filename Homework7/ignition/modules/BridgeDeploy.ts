import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BridgeDeploy", (m) => {
  const wormhole = m.getParameter("wormhole");

  const bridge = m.contract("SimpleWormholeTokenBridge", [wormhole]);

  return { bridge };
});
