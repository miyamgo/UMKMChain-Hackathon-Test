import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import { fetchFromIPFS } from '../utils/ipfs';

const MySubmissions = ({ submissions, umkmContract }) => {
  const [submissionsWithStatus, setSubmissionsWithStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!umkmContract || submissions.length === 0) {
        setIsLoading(false);
        setSubmissionsWithStatus(submissions.map(s => ({ ...s, onChainData: null })));
        return;
      }
      
      setIsLoading(true);
      try {
        const promises = submissions.map(s => umkmContract.getAssetDataByHash(s.hash));
        const onChainResults = await Promise.all(promises);
        
        const combinedData = submissions.map((s, index) => ({
          ...s,
          onChainData: onChainResults[index]
        }));
        
        setSubmissionsWithStatus(combinedData);
      } catch (error) {
        console.error("Gagal mengambil status on-chain:", error);
        toast.error("Gagal sinkronisasi data dengan blockchain.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();
  }, [submissions, umkmContract]);

  const handleDownloadCertificate = async (submission) => {
    toast.info("Membuat sertifikat PDF...");
    try {
        // 1. Ambil detail data dari IPFS
        const submissionPackage = await fetchFromIPFS(submission.ipfsCid);
        const details = submissionPackage.data;

        // 2. Ambil status on-chain terbaru
        const onChainData = await umkmContract.getAssetDataByHash(submission.hash);
        const statusText = onChainData.isVerified ? 'SAH / Terverifikasi' : 'TIDAK SAH / Menunggu Verifikasi';

        // 3. Buat PDF
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Sertifikat Digital UMKMChain", 105, 20, { align: 'center' });

        // Konten
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nama Usaha: ${details.namaUsaha}`, 20, 40);
        doc.text(`Nomor Induk Berusaha (NIB): ${details.nib}`, 20, 50);
        doc.text(`Nama Pemilik: ${details.namaLengkap}`, 20, 60);
        doc.text(`Status Verifikasi: ${statusText}`, 20, 70);
        doc.text(`Alasan/Catatan: ${onChainData.reason}`, 20, 80);
        
        // QR Code
        const qrCanvas = document.getElementById(`qr-${submission.hash}`);
        const qrDataURL = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataURL, 'PNG', 75, 100, 60, 60);
        
        // Hash
        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        doc.text("Hash Aset (On-Chain):", 105, 170, { align: 'center'});
        doc.text(submission.hash, 105, 175, { align: 'center'});

        // Simpan file
        doc.save(`Sertifikat-UMKMChain-${details.nib}.pdf`);
        toast.success("Sertifikat berhasil dibuat!");

    } catch (error) {
        console.error("Gagal membuat PDF:", error);
        toast.error("Gagal membuat sertifikat PDF.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-5">Menyinkronkan data dengan blockchain...</div>;
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-3 fw-bold">Pengajuan Saya</h4>
      {submissionsWithStatus.length === 0 ? (
        <div className="alert alert-info">Anda belum memiliki pengajuan.</div>
      ) : (
        <div className="row g-4">
          {submissionsWithStatus.map((s) => {
            const status = s.onChainData?.isVerified ? 'SAH' : 'PENDING';
            const reason = s.onChainData?.reason || 'Menunggu verifikasi';
            return (
              <div key={s.hash} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{s.assetType}</h5>
                     <span className={`badge ${status === 'SAH' ? 'bg-success' : 'bg-warning text-dark'}`}>{status}</span>
                     <p className="small text-muted mt-2">Alasan: {reason}</p>
                    <hr/>
                    <p className="card-text small font-monospace text-break">
                      <strong>Hash:</strong> {s.hash}
                    </p>
                    {/* Hidden QR Code for PDF generation */}
                    <div style={{ display: 'none' }}>
                       <QRCodeCanvas id={`qr-${s.hash}`} value={s.hash} size={256} />
                    </div>
                  </div>
                   <div className="card-footer bg-white border-0">
                      <div className="d-grid">
                        <button className="btn btn-primary" onClick={() => handleDownloadCertificate(s)}>
                          Download Sertifikat (PDF)
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
