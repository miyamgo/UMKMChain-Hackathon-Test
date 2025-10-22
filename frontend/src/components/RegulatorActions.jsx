import React, { useState } from 'react';
import { toast } from 'react-toastify';

const RegulatorActions = ({ submission, onChainData, umkmContract }) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk menangani keputusan (Setuju/Tolak/Cabut)
  const handleDecision = async (action) => {
    if (!umkmContract || !onChainData) {
      toast.error("Kontrak tidak terinisialisasi.");
      return;
    }
    if (!reason.trim()) {
      toast.warning("Harap masukkan alasan untuk keputusan Anda.");
      return;
    }

    setIsLoading(true);
    try {
      let tx;
      const tokenId = await umkmContract.getTokenIdByHash(submission.hash);
      
      if (tokenId === 0n) { // 0n is the BigInt representation of 0
        toast.error("Token ID tidak ditemukan untuk hash ini.");
        setIsLoading(false);
        return;
      }
      
      toast.info(`Mengirim transaksi ${action}... Harap konfirmasi di wallet.`);

      if (action === 'verify') {
        tx = await umkmContract.setVerifiedStatus(tokenId, reason);
      } else if (action === 'revoke') {
        tx = await umkmContract.revokeAsset(tokenId, reason);
      }

      await tx.wait();
      toast.success(`Aksi ${action} berhasil dicatat di blockchain!`);
      // Idealnya, panggil fungsi untuk me-refresh data di sini
    } catch (error) {
      console.error(`Gagal melakukan aksi ${action}:`, error);
      const revertReason = error.reason || "Transaksi ditolak oleh contract.";
      toast.error(`Gagal: ${revertReason}`);
    } finally {
      setIsLoading(false);
      setReason('');
    }
  };

  if (!onChainData) {
    return <p className="text-muted">Memuat status on-chain...</p>;
  }

  return (
    <div>
      <h5>D. Aksi Regulator</h5>
      <div className="alert alert-secondary">
        <strong>Status Saat Ini:</strong> 
        {onChainData.isVerified ? 
            <span className="badge bg-success ms-2">SAH / Terverifikasi</span> : 
            <span className="badge bg-danger ms-2">TIDAK SAH / Dicabut</span>
        }
        <p className="mb-0 mt-1 small"><strong>Alasan:</strong> {onChainData.reason}</p>
      </div>

      <div className="mb-3">
        <label htmlFor="reasonInput" className="form-label">Alasan Keputusan</label>
        <input 
          type="text" 
          id="reasonInput"
          className="form-control"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Dokumen NIB valid dan terverifikasi"
          disabled={isLoading}
        />
      </div>

      <div className="d-flex gap-2">
        <button 
          className="btn btn-success" 
          onClick={() => handleDecision('verify')}
          disabled={isLoading || onChainData.isVerified}
        >
          {isLoading ? 'Memproses...' : 'Setujui (SAH)'}
        </button>
        <button 
          className="btn btn-danger" 
          onClick={() => handleDecision('revoke')}
          disabled={isLoading || !onChainData.isVerified}
        >
          {isLoading ? 'Memproses...' : 'Cabut Izin'}
        </button>
      </div>
      <p className="form-text">
        Aksi ini akan mencatat keputusan Anda secara permanen di blockchain.
      </p>
    </div>
  );
};

export default RegulatorActions;

