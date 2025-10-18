// frontend/src/components/tabs/RegulatorTab.jsx

import React from 'react';

const RegulatorTab = ({ umkmContract, setStatusMessage }) => {
    
    const handleRegulatorAction = async (actionType) => {
        if (!umkmContract) return;

        const tokenId = prompt("Masukkan Token ID yang ingin diubah (Contoh: 1):");
        if (!tokenId || isNaN(tokenId)) return;
        
        try {
            let reason = prompt(`Masukkan alasan untuk ${actionType}:`);
            if (!reason) return;
            
            let tx;
            if (actionType === 'VERIFY') {
                tx = await umkmContract.setVerifiedStatus(tokenId, reason);
            } else if (actionType === 'REVOKE') {
                tx = await umkmContract.revokeAsset(tokenId, reason);
            }
            
            setStatusMessage({ type: 'warning', text: `Transaksi ${actionType} dikirim. Menunggu konfirmasi...` });
            await tx.wait();
            setStatusMessage({ type: 'success', text: `✅ Status Aset #${tokenId} berhasil diubah oleh Regulator.` });

        } catch (error) {
            // Ini akan menangkap error "AccessControl: sender missing role" dari Solidity
            setStatusMessage({ type: 'danger', text: "❌ Aksi Regulator gagal. Pastikan Anda punya REGULATOR_ROLE dan Token ID benar." });
            console.error(error);
        }
    };

    return (
        <div className="p-3">
            <h4 className="fw-bold">4. Audit Regulator (Akses Khusus)</h4>
            <p className="text-danger fw-bold mb-3">Anda terdeteksi sebagai Regulator. Ubah status aset dengan memasukkan Token ID.</p>
            <div className="d-grid gap-2">
                <button 
                    className="btn btn-success btn-lg" 
                    onClick={() => handleRegulatorAction('VERIFY')}
                >
                    ✅ Set Status: SAH (Verifikasi)
                </button>
                <button 
                    className="btn btn-danger btn-lg" 
                    onClick={() => handleRegulatorAction('REVOKE')}
                >
                    ❌ Set Status: DICABUT (Expired)
                </button>
            </div>
        </div>
    );
};

export default RegulatorTab;