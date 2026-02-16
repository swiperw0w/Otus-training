import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TrustlessMarketplaceModule", (m) => {

  const marketplace = m.contract("TrustlessMarketplace");

  return { marketplace };
});
