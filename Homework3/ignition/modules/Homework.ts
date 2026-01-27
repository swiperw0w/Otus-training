import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Homework", (m) => {
  const Homework = m.contract("Homework");

  return { Homework };
});
