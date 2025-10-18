// scripts/deploy.js (COMMONJS)

const { ethers } = require("hardhat");

async function main() {
  // Ambil akun pertama Hardhat sebagai Regulator lokal (0xf39F...)
  const [regulator] = await ethers.getSigners();
  
  const UMKMRegistry = await ethers.getContractFactory("UMKMRegistry");
  const umkmRegistry = await UMKMRegistry.deploy(regulator.address); 
  
  await umkmRegistry.waitForDeployment();
  
  const contractAddress = await umkmRegistry.getAddress();

  console.log(`\n=======================================================`);
  console.log(`✅ DEPLOYMENT LOKAL BERHASIL`);
  console.log(`Kontrak UMKMRegistry Address: ${contractAddress}`);
  console.log(`Wallet Regulator (Deployer) : ${regulator.address}`);
  console.log(`=======================================================\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});