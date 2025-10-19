const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying UMKMRegistry Contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying dengan akun:", deployer.address);

  // GANTI dengan address wallet yang akan jadi Regulator
  const REGULATOR_ADDRESS = "0xYourRegulatorAddressHere";

  const UMKMRegistry = await hre.ethers.getContractFactory("UMKMRegistry");
  const umkmRegistry = await UMKMRegistry.deploy(REGULATOR_ADDRESS);

  await umkmRegistry.waitForDeployment();

  const contractAddress = await umkmRegistry.getAddress();

  console.log("\n✅ UMKMRegistry deployed to:", contractAddress);
  console.log("🔐 Regulator Address:", REGULATOR_ADDRESS);
  console.log("\n📋 COPY ADDRESS INI KE frontend/src/contractConfig.js:");
  console.log(`export const CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log(`export const REGULATOR_ADDRESS = "${REGULATOR_ADDRESS}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });