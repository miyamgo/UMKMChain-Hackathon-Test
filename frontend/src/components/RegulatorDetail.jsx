import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

// [PERUBAHAN] Import fungsi baru yang lebih tangguh dari ipfs.js
import { fetchFromIPFS } from '../utils/ipfs'; 
import RegulatorActions from './RegulatorActions';

const RegulatorDetail = ({ submission, umkmContract, onBack }) => {
  const [detailedData, setDetailedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onChainData, setOnChainData] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      if (!submission || !submission.ipfsCid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // [PERUBAHAN] Gunakan fetchFromIPFS untuk mengambil data dari IPFS
        const submissionPackage = await fetchFromIPFS(submission.ipfsCid);
        setDetailedData(submissionPackage.data);

        // Ambil juga data on-chain terbaru untuk status
        if (umkmContract && submission.hash) {
          const data = await umkmContract.getAssetDataByHash(submission.hash);
          setOnChainData(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dari IPFS:", error);
        toast.error("Gagal memuat detail: Data tidak dapat diakses dari IPFS.");
        setDetailedData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [submission, umkmContract]);

  if (isLoading) {
    return <div className="text-center p-5">Memuat detail pengajuan dari IPFS...</div>;
  }

  if (!detailedData) {
    return (
        <div className="container mt-4 text-center">
            <div className="alert alert-danger">
                <h4>Gagal Memuat Data</h4>
                <p>Tidak dapat mengambil detail pengajuan dari IPFS. Ini bisa terjadi jika gateway sedang sibuk atau data tidak tersedia di jaringan.</p>
                <button className="btn btn-secondary" onClick={onBack}>Kembali ke Daftar</button>
            </div>
        </div>
    );
  }

  return (
    <div className="container mt-4">
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={onBack}>
            &larr; Kembali ke Daftar Pengajuan
        </button>
        <div className="card shadow-sm">
            <div className="card-header bg-light">
                <h4 className="mb-0">Detail Pengajuan: {detailedData.namaUsaha}</h4>
            </div>
            <div className="card-body">
                {/* Tampilkan detail data di sini */}
                <h5>A. Data Pelaku Usaha</h5>
                <p><strong>Nama Lengkap:</strong> {detailedData.namaLengkap}</p>
                <p><strong>NIK:</strong> {detailedData.nik}</p>
                <hr/>
                <h5>B. Data Usaha</h5>
                <p><strong>Nama Usaha:</strong> {detailedData.namaUsaha}</p>
                <p><strong>Nomor Induk Berusaha (NIB):</strong> {detailedData.nib}</p>
                 <hr/>
                <h5>C. Dokumen Terlampir (dari IPFS)</h5>
                {detailedData.fileNIB_cid ? (
                    <a href={`https://gateway.pinata.cloud/ipfs/${detailedData.fileNIB_cid}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                        Lihat Dokumen NIB
                    </a>
                ) : (
                    <p className="text-muted">Tidak ada dokumen NIB terlampir.</p>
                )}
                 <hr/>
                <RegulatorActions 
                    submission={submission}
                    onChainData={onChainData}
                    umkmContract={umkmContract}
                />
            </div>
             <div className="card-footer text-muted small">
                <strong>Hash:</strong> <span className="font-monospace">{submission.hash}</span><br/>
                <strong>Master CID:</strong> <span className="font-monospace">{submission.ipfsCid}</span>
            </div>
        </div>
    </div>
  );
};

export default RegulatorDetail;

