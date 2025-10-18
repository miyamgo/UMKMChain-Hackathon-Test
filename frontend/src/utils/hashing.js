// frontend/src/utils/hashing.js

import { sha256 } from 'js-sha256';

/**
 * Menghitung Hash Final SHA-256 dari gabungan input teks UMKM.
 */
export const getFinalHash = (data) => {
    
    // Urutan dan normalisasi harus konsisten!
    const combinedString = [
        data.nomorIzin.toLowerCase().trim(),
        data.tglPenerbitan.toLowerCase().trim(),
        data.namaUsaha.toLowerCase().trim(),
        data.jenisPerizinan.toLowerCase().trim()
    ].join('|'); 

    const hash = sha256(combinedString);
    
    return '0x' + hash;
};