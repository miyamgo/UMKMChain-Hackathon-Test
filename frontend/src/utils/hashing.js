import { ethers } from 'ethers';

export const getFinalHash = (data) => {
    const combinedString = [
        data.nomorIzin.toLowerCase().trim(),
        data.tglPenerbitan.toLowerCase().trim(),
        data.namaUsaha.toLowerCase().trim(),
        data.jenisPerizinan.toLowerCase().trim()
    ].join('|'); 

    // Pakai keccak256 (sama seperti Solidity)
    return ethers.keccak256(ethers.toUtf8Bytes(combinedString));
};