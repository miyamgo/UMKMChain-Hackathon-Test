import { ethers } from 'ethers';

export const getFinalHash = (data) => {
    // defensively handle missing fields
    const safe = (v) => (v === undefined || v === null) ? '' : String(v);

    const combinedString = [
        // A. identity
        safe(data.namaLengkap).toLowerCase().trim(),
        safe(data.nik).toLowerCase().trim(),
        safe(data.npwpPribadi).toLowerCase().trim(),
        safe(data.alamatKTP).toLowerCase().trim(),
        safe(data.rtRw).toLowerCase().trim(),
        safe(data.kelurahan).toLowerCase().trim(),
        safe(data.kecamatan).toLowerCase().trim(),
        safe(data.kotaKab).toLowerCase().trim(),
        safe(data.provinsi).toLowerCase().trim(),
        safe(data.kodePos).toLowerCase().trim(),
        safe(data.alamatDomisili).toLowerCase().trim(),

        // B. business
        safe(data.namaUsaha).toLowerCase().trim(),
        safe(data.nib).toLowerCase().trim(),
        safe(data.bentukBadan).toLowerCase().trim(),
        safe(data.skalaUsaha).toLowerCase().trim(),
        safe(data.sektorUsaha).toLowerCase().trim(),
        safe(data.alamatUsaha).toLowerCase().trim(),
        safe(data.tahunBerdiri).toLowerCase().trim(),
        safe(data.jumlahTenagaKerja).toLowerCase().trim(),
        safe(data.kisaranOmzet).toLowerCase().trim(),

        // C. documents (include base64 data where available)
        safe(data.fileNIB).toLowerCase().trim(),
        safe(data.fileIUMK).toLowerCase().trim(),
        safe(data.fileSIUP).toLowerCase().trim(),
        safe(data.fileNPWPBadan).toLowerCase().trim(),
        safe(data.fileSertifikatHalal).toLowerCase().trim(),
        safe(data.fileBPOM).toLowerCase().trim(),
        safe(data.fileSertifikatMerek).toLowerCase().trim(),

        // D. land status
        safe(data.statusKepemilikan).toLowerCase().trim(),
        safe(data.fileSHM).toLowerCase().trim(),
        safe(data.fileAJB).toLowerCase().trim(),
        safe(data.filePBB).toLowerCase().trim(),
        safe(data.filePerjanjianSewa).toLowerCase().trim(),
        safe(data.fileSuratPernyataan).toLowerCase().trim(),
        safe(data.fileKTPPemilikTempat).toLowerCase().trim(),
        safe(data.imb).toLowerCase().trim(),

        // location and contact
        safe(data.landLat).toLowerCase().trim(),
        safe(data.landLng).toLowerCase().trim(),
        safe(data.contactPhone).toLowerCase().trim(),
        safe(data.contactEmail).toLowerCase().trim(),
        safe(data.additionalNotes).toLowerCase().trim()
    ].join('|');

    return ethers.keccak256(ethers.toUtf8Bytes(combinedString));
};