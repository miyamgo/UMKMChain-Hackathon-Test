import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AdminPurge = ({ submissions, onReload }) => {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Fungsi untuk menghapus semua data dari localStorage
  const deleteAllSubmissions = () => {
    localStorage.removeItem('umkm_submissions');
    toast.success('Semua data pengajuan lokal telah dihapus.');
    setConfirmDeleteAll(false);
    onReload(); // Memuat ulang state di App.jsx agar UI update
  };

  // Fungsi untuk menghapus satu data spesifik berdasarkan hash
  const deleteSingleSubmission = (hashToDelete) => {
    const currentSubmissions = JSON.parse(localStorage.getItem('umkm_submissions') || '[]');
    const newSubmissions = currentSubmissions.filter(s => s.hash !== hashToDelete);
    localStorage.setItem('umkm_submissions', JSON.stringify(newSubmissions));
    toast.info(`Pengajuan dengan hash ${hashToDelete.substring(0,10)}... telah dihapus.`);
    onReload();
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-danger shadow-sm">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Admin Purge - Manajemen Data Lokal</h4>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Fitur ini digunakan untuk menghapus data pengajuan yang tersimpan di browser Anda (`localStorage`). 
                Tindakan ini tidak akan menghapus data yang sudah ada di blockchain.
              </p>
              
              <div className="alert alert-warning">
                <strong>Perhatian!</strong> Tindakan di halaman ini tidak dapat diurungkan.
              </div>

              {!confirmDeleteAll ? (
                <div className="d-grid">
                  <button 
                    className="btn btn-danger" 
                    onClick={() => setConfirmDeleteAll(true)}
                    disabled={submissions.length === 0}
                  >
                    Hapus Semua Data Pengajuan Lokal
                  </button>
                </div>
              ) : (
                <div className="text-center p-3 bg-light rounded">
                  <p className="fw-bold">Apakah Anda yakin ingin menghapus semua {submissions.length} data pengajuan?</p>
                  <button className="btn btn-danger me-2" onClick={deleteAllSubmissions}>Ya, Hapus Semua</button>
                  <button className="btn btn-secondary" onClick={() => setConfirmDeleteAll(false)}>Batal</button>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              Daftar Pengajuan Lokal ({submissions.length})
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {submissions.length > 0 ? (
                <ul className="list-group">
                  {submissions.map(submission => (
                    <li key={submission.hash} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">{submission.assetType}</span>
                        <p className="mb-0 small text-muted font-monospace">{submission.hash}</p>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteSingleSubmission(submission.hash)}
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-center">Tidak ada data pengajuan lokal.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPurge;
