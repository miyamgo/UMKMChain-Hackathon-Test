import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

const Verify = ({ umkmContract }) => {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const doCheck = async () => {
    const cleanedHash = String(hash || '').trim();
    if (!cleanedHash) {
      return toast.warning("Harap masukkan hash untuk diverifikasi.");
    }
    
    // Memvalidasi format hash
    if (!ethers.isHexString(cleanedHash, 32)) {
        return toast.error("Format hash tidak valid. Harap masukkan 32-byte hash (diawali 0x...).");
    }

    if (!umkmContract) {
      return toast.error("Kontrak belum terinisialisasi. Harap hubungkan wallet terlebih dahulu.");
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await umkmContract.getAssetDataByHash(cleanedHash);
      
      // Kontrak akan mengembalikan struct kosong jika hash tidak ditemukan.
      // Kita cek alamat owner untuk memastikan ini adalah data yang valid.
      if (data.owner === ethers.ZeroAddress) {
        setResult({
          success: false,
          reason: "Hash tidak ditemukan di blockchain."
        });
      } else {
        setResult({
          success: true,
          owner: data.owner,
          isVerified: data.isVerified,
          reason: data.reason,
          timestamp: new Date(Number(data.timestamp) * 1000).toLocaleString('id-ID')
        });
      }
    } catch (error) {
      console.error("Verifikasi on-chain gagal:", error);
      toast.error("Terjadi kesalahan saat memverifikasi hash.");
      setResult({ success: false, reason: "Gagal berkomunikasi dengan smart contract." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Verifikasi Keaslian Aset</h5>
      </div>
      <div className="card-body">
        <p className="small text-muted">
          Masukkan hash unik dari sertifikat atau izin untuk mengecek statusnya secara on-chain.
        </p>
        <div className="mb-3">
          <label htmlFor="hashInputVerify" className="form-label">Hash Aset</label>
          <input
            id="hashInputVerify"
            className="form-control font-monospace"
            placeholder="0x..."
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="d-grid">
          <button className="btn btn-primary" onClick={doCheck} disabled={isLoading}>
            {isLoading ? 'Memverifikasi...' : 'Cek Hash'}
          </button>
        </div>

        {result && (
          <div className="mt-4">
            <h6>Hasil Verifikasi:</h6>
            {result.success ? (
              <div className="alert alert-success">
                <strong>✓ Aset Terdaftar & Asli</strong><br/>
                <strong>Status:</strong> {result.isVerified ? 
                  <span className="fw-bold text-success">SAH</span> : 
                  <span className="fw-bold text-warning">TIDAK SAH / DICABUT</span>
                }<br/>
                <strong>Alasan:</strong> {result.reason}<br/>
                <strong>Pemilik:</strong> <small className="font-monospace">{result.owner}</small><br/>
                <strong>Terdaftar pada:</strong> {result.timestamp}
              </div>
            ) : (
              <div className="alert alert-danger">
                <strong>✗ Aset Tidak Ditemukan</strong><br/>
                {result.reason}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
