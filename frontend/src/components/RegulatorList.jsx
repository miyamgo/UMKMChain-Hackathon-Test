import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { fetchFromIPFS } from '../utils/ipfs';

// [PERUBAHAN] Terima prop onDelete
const RegulatorList = ({ submissions, onOpen, umkmContract, onDelete }) => {
  const [submissionsWithDetails, setSubmissionsWithDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Set initial state ke false
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (submissions.length === 0) {
        setSubmissionsWithDetails([]); // Pastikan data kosong jika tidak ada submission
        setIsLoading(false);
        return;
      }
      
      // [PERBAIKAN] Guard clause untuk memastikan contract siap
      if (!umkmContract) {
        // Jangan tampilkan loading, karena kita menunggu koneksi
        return; 
      }
      
      setIsLoading(true);
      try {
        const promises = submissions.map(async (s) => {
          try {
            const onChainData = await umkmContract.getAssetDataByHash(s.hash);
            const ipfsData = await fetchFromIPFS(s.ipfsCid);
            return { ...s, onChainData, ipfsData: ipfsData.data };
          } catch (e) {
            console.error(`Gagal memuat detail untuk hash ${s.hash}`, e);
            return { ...s, onChainData: null, ipfsData: null };
          }
        });
        
        const combinedData = await Promise.all(promises);
        setSubmissionsWithDetails(combinedData);
      } catch (error) {
        console.error("Gagal mengambil data on-chain:", error);
        toast.error("Gagal sinkronisasi data dengan blockchain.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDetails();
  }, [submissions, umkmContract]);

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissionsWithDetails;
    const query = searchQuery.toLowerCase();
    return submissionsWithDetails.filter(s => 
      s.hash.toLowerCase().includes(query) ||
      s.ipfsData?.namaUsaha?.toLowerCase().includes(query) ||
      s.ipfsData?.nib?.toLowerCase().includes(query)
    );
  }, [searchQuery, submissionsWithDetails]);
  
  if (isLoading) {
    return <div className="text-center p-5">Menyinkronkan data dengan blockchain...</div>;
  }
  
  if (submissions.length === 0) {
    return (
        <div className="container mt-4 text-center">
            <div className="alert alert-secondary">
                <h4>Belum Ada Pengajuan</h4>
                <p>Saat ini belum ada data pengajuan yang tersimpan di sistem.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-3 fw-bold">Daftar Semua Pengajuan</h4>
      <div className="mb-3">
        <input 
          type="text"
          className="form-control"
          placeholder="Cari berdasarkan Nama Usaha, NIB, atau Hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="row">
        <div className="col-md-8">
          <h5>Hasil ({filteredSubmissions.length})</h5>
          {filteredSubmissions.length === 0 ? (
            <div className="alert alert-info">Tidak ada pengajuan yang cocok.</div>
          ) : (
            <div className="list-group">
              {filteredSubmissions.map(s => (
                // [PERUBAHAN] Mengubah <a> menjadi <div> untuk menampung tombol hapus
                <div key={s.hash} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div style={{ cursor: 'pointer', flexGrow: 1 }} onClick={() => onOpen(s)}>
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{s.ipfsData?.namaUsaha || 'Data tidak termuat'}</h5>
                      <div>
                        {s.onChainData?.isVerified ? (
                          <span className="badge bg-success">SAH</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </div>
                    </div>
                    <p className="mb-1 small">NIB: {s.ipfsData?.nib || '-'}</p>
                    <small className="text-muted font-monospace">{s.hash}</small>
                  </div>
                  {/* [FITUR BARU] Tombol untuk menghapus dari tampilan lokal */}
                  <button 
                    className="btn btn-sm btn-outline-danger ms-3"
                    title="Hapus dari tampilan lokal"
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah detail terbuka saat menghapus
                      onDelete(s.hash);
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-md-4">
          <h5>Status Pengajuan</h5>
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Pending
              <span className="badge bg-warning rounded-pill">
                {submissionsWithDetails.filter(s => s.onChainData && !s.onChainData.isVerified).length}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              SAH
              <span className="badge bg-success rounded-pill">
                {submissionsWithDetails.filter(s => s.onChainData?.isVerified).length}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Total
              <span className="badge bg-primary rounded-pill">{submissions.length}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegulatorList;

