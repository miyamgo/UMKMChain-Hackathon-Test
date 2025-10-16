// hardhat.config.js (Pastikan ini menggunakan sintaks ESM)

import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Tambahkan ini jika Anda menggunakan file .env (Sangat disarankan)

// --- KONFIGURASI JARINGAN DITAMBAHKAN DI SINI ---
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "YOUR_API_KEY_HERE";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20", // Direkomendasikan naikkan ke 0.8.20+ untuk stabilitas
  
  defaultNetwork: "hardhat",

  // --- Obyek Networks Ditambahkan ---
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111, // ID Jaringan Sepolia
    }
  }
};

export default config;