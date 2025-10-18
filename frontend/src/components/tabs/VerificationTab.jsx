// frontend/src/components/tabs/VerificationTab.jsx

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getFinalHash } from '../../utils/hashing';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_RPC_URL } from '../../contractConfig';

const VerificationTab = ({ formData, setStatusMessage }) => {
    const [verificationResult, setVerificationResult] = useState(null);

    const handleVerificationCheck = async () => {
        if (!formData.nomorIzin || !formData.namaUsaha) {
            setStatusMessage({ type: 'warning', text: "Isi Nomor Izin dan Nama Usaha di tab Pendaftaran untuk diverifikasi." });
            return;
        }
        
        try {
            const hashToVerify = getFinalHash(formData);
            
            // Provider read-only (Gratis Gas Fee)
            const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
            const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            const assetData = await readContract.getAssetDataByHash(hashToVerify);
            
            if (assetData.owner === ethers.ZeroAddress) {
                setVerificationResult({ success: false, reason: "HASH TIDAK TERDAFTAR atau DIMODIFIKASI." });
            } else {
                setVerificationResult({
                    success: true,
                    isVerified: assetData.isVerified,
                    owner: assetData.owner,
                    reason: assetData.reason,
                    assetType: assetData.assetType
                });
            }
            setStatusMessage({ type: 'info', text: 'Verifikasi instan selesai.' });
        } catch (error) {
            setVerificationResult(null);
            setStatusMessage({ type: 'danger', text: "❌ Verifikasi gagal. Cek konsol (Error RPC/Kontrak)." });
            console.error("Kesalahan Verifikasi:", error);
        }
    };
    
    return (
        <div className="p-3">
            <h4 className="fw-bold">3. Verifikasi Instan (Role: Lembaga Keuangan)</h4>
            <p className="text-muted">Menggunakan data di form untuk cek Hash kontrak. (Gratis Gas Fee)</p>
            
            <button 
                className="btn btn-info w-100 btn-lg mb-3" 
                onClick={handleVerificationCheck}
                disabled={!formData.nomorIzin}
            >
                ✓ VERIFIKASI INSTAN
            </button>
            
            {verificationResult && (
                <div className={`mt-3 p-3 border rounded ${verificationResult.success ? 'border-success bg-light' : 'border-danger bg-light'}`}>
                    <h6 className="fw-bold">{verificationResult.success ? '✅ HASH TERDAFTAR' : '❌ HASH TIDAK TERDAFTAR'}</h6>
                    {verificationResult.success && (
                        <>
                            <hr />
                            <p className="mb-2"><strong>Status Legalitas:</strong> <span className={`ms-2 badge ${verificationResult.isVerified ? 'bg-success' : 'bg-warning text-dark'}`}>{verificationResult.isVerified ? 'SAH & TERVERIFIKASI' : 'MENUNGGU/DICABUT'}</span></p>
                            <p className="mb-2"><strong>Alasan:</strong> {verificationResult.reason}</p>
                            <p className="mb-0 small text-break"><strong>Pemilik:</strong> {verificationResult.owner}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default VerificationTab;