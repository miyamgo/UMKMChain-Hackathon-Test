const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying UMKMRegistry Contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying dengan akun:", deployer.address);

  // Gunakan address deployer sebagai regulator
  // Anda bisa menggantinya dengan address lain yang valid jika perlu
  const REGULATOR_ADDRESS = deployer.address;
  
  console.log("🔐 Regulator akan diset ke:", REGULATOR_ADDRESS);

  const UMKMRegistry = await hre.ethers.getContractFactory("UMKMRegistry");
  console.log("\n⏳ Deploying contract...");
  
  const umkmRegistry = await UMKMRegistry.deploy(REGULATOR_ADDRESS);

  console.log("⏳ Menunggu konfirmasi deployment...");
  await umkmRegistry.waitForDeployment();

  const contractAddress = await umkmRegistry.getAddress();

  console.log("\n✅ UMKMRegistry berhasil di-deploy!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔐 Regulator Address:", REGULATOR_ADDRESS);
  console.log("\n" + "=".repeat(60));
  console.log("📋 COPY ADDRESS INI KE frontend/src/contractConfig.js:");
  console.log("=".repeat(60));
  console.log(`export const CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log(`export const REGULATOR_ADDRESS = "${REGULATOR_ADDRESS}";`);
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error saat deployment:");
    console.error(error);
    process.exit(1);
  });