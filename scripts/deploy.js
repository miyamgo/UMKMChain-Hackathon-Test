// scripts/deploy.js

import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // Hardhat akan menggunakan PRIVATE_KEY dari .env sebagai deployer/Regulator.
  const [deployer] = await ethers.getSigners();
  
  const regulatorAddress = deployer.address; 

  // Dapatkan Contract Factory untuk UMKMRegistry
  const UMKMRegistry = await ethers.getContractFactory("UMKMRegistry");
  
  // Deploy kontrak. KONTRAK MEMBUTUHKAN 1 PARAMETER: initialRegulator
  const umkmRegistry = await UMKMRegistry.deploy(regulatorAddress); 
  
  // Tunggu hingga deployment selesai
  await umkmRegistry.waitForDeployment();
  
  const contractAddress = await umkmRegistry.getAddress();

  // --- OUTPUT LOG YANG SUDAH DIRAPIHKAN ---
  
  console.log("\n=======================================================");
  console.log("             DEPLOYMENT UMKMChain BERHASIL           ");
  console.log("=======================================================");
  console.log(`Jaringan Uji Coba: Sepolia Testnet`);
  console.log(`Waktu Deployment: ${new Date().toLocaleTimeString()} WIB`); // Menampilkan waktu lokal
  console.log("-------------------------------------------------------");
  console.log(`Wallet Regulator (Deployer) : ${deployer.address}`);
  console.log(`Kontrak UMKMRegistry Address: ${contractAddress}`);
  console.log("=======================================================\n");
}

// Jalankan script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});