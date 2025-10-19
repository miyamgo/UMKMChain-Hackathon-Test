import React, { useState } from 'react';

const Verify = ({ onCheck }) => {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);

  const doCheck = async () => {
    const cleaned = String(hash || '').trim();
    if (!cleaned) return;
    // onCheck may be async and return details
    const res = await onCheck(cleaned);
    setResult(res || null);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-info text-white">Verifikasi (gunakan Hash)</div>
            <div className="card-body">
              <p className="small text-muted">Masukkan hash yang diterima dari hasil pendaftaran (atau scan QR) untuk mengecek status on-chain.</p>
              <div className="mb-3">
                <label className="form-label">Hash Aset</label>
                <input
                  className="form-control"
                  placeholder="0xabc123..."
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2 mb-3">
                <button className="btn btn-info" onClick={doCheck} disabled={!hash}>Cek Hash</button>
              </div>

              {result && (
                <div className="mt-3">
                  <h6>Hasil Verifikasi</h6>
                  <div className="mb-2">
                    <strong>Status:</strong> {result.success ? (result.isVerified ? <span className="badge bg-success">ACC</span> : <span className="badge bg-warning text-dark">Terverifikasi? Tidak</span>) : <span className="badge bg-secondary">Tidak Ditemukan</span>}
                  </div>
                  <div><strong>Owner:</strong> {result.owner || '-'}</div>
                  <div><strong>Reason:</strong> {result.reason || '-'}</div>
                  <div><strong>Timestamp:</strong> {result.timestamp ? new Date(result.timestamp * 1000).toLocaleString() : '-'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
