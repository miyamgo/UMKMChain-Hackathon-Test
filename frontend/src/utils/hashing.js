import { ethers } from 'ethers';

// [UPDATED] Fungsi ini sekarang men-hash string dari objek JSON
// untuk memastikan integritas seluruh paket data.
export const getFinalHash = (jsonObject) => {
  // 1. Ubah seluruh objek JSON menjadi sebuah string tunggal.
  // JSON.stringify memastikan formatnya konsisten.
  const combinedString = JSON.stringify(jsonObject);

  // 2. Hitung hash Keccak256 dari string tersebut.
  // Ini adalah "sidik jari digital" dari seluruh paket data.
  return ethers.keccak256(ethers.toUtf8Bytes(combinedString));
};

