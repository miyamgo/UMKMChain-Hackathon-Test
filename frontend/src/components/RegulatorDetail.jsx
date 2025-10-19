import React, { useEffect, useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const mask = (s, keepStart = 4, keepEnd = 4) => {
  if (!s) return '-';
  if (s.length <= keepStart + keepEnd) return s;
  return s.substring(0, keepStart) + '*'.repeat(s.length - keepStart - keepEnd) + s.substring(s.length - keepEnd);
};

const downloadFileFromBase64 = (name, b64) => {
  try {
    const blob = b64.startsWith('data:') ? (fetch(b64).then(r=>r.blob())) : Promise.resolve(new Blob([atob(b64)], { type: 'application/octet-stream' }));
    blob.then(bl => {
      const url = URL.createObjectURL(bl);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    });
  } catch (e) {
    console.error('Download error', e);
  }
};

const pushAudit = (entry) => {
  try {
    const raw = localStorage.getItem('audit_log') || '[]';
    const arr = JSON.parse(raw);
    arr.unshift(entry);
    localStorage.setItem('audit_log', JSON.stringify(arr));
  } catch (e) { console.error(e); }
};

const RegulatorDetail = ({ item, onDecision, user }) => {
  const [showSensitive, setShowSensitive] = useState(false);

  useEffect(() => {
    if (!item) return;
    // log opening
    pushAudit({ action: 'OPEN_DETAIL', by: user?.address || user?.name || 'unknown', hash: item.hash, at: Date.now() });
  }, [item, user]);

  if (!item) return null;

  const handleDecision = (approved) => {
    const reason = prompt('Masukkan alasan untuk keputusan (wajib):');
    if (!reason) return alert('Alasan diperlukan');
    pushAudit({ action: approved ? 'APPROVE' : 'REJECT', by: user?.address || user?.name || 'unknown', hash: item.hash, reason, at: Date.now() });
    // pass reason back to parent so it can be persisted to the submission record
    if (typeof onDecision === 'function') onDecision(item, approved, reason);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <strong>Detail Pengajuan</strong>
            <div className="small text-muted">{item.namaUsaha} • {item.nomorIzin}</div>
          </div>
          <div className="text-end">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setShowSensitive(s => !s)}>{showSensitive ? 'Sembunyikan Data Sensitif' : 'Tampilkan Data Sensitif'}</button>
          </div>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h5>{item.namaUsaha}</h5>
              <p><strong>Nama Pemilik:</strong> {showSensitive ? (item.namaPemilik || '-') : mask(item.namaPemilik || '-', 2, 0)}</p>
              <p><strong>NIK:</strong> {showSensitive ? (item.nik || '-') : mask(item.nik || '-', 2, 2)}</p>
              <p><strong>NPWP:</strong> {showSensitive ? (item.npwp || '-') : (item.npwp ? mask(item.npwp, 3, 3) : '-')}</p>
              <p><strong>Alamat KTP:</strong> {showSensitive ? (item.alamat || '-') : (item.alamat ? (item.alamat.substring(0,60) + '...') : '-')}</p>
              <p><strong>Alamat Domisili:</strong> {item.alamatDomisili || '-'}</p>
              <p><strong>Jenis Usaha / KBLI:</strong> {item.jenisUsaha} / {item.kbli || '-'}</p>
              <p><strong>Hak Tanah:</strong> {item.hakTanah} - {item.luasTanah || '-'} m2</p>
              <p><strong>Tahun Berdiri:</strong> {item.tahunBerdiri || '-'}</p>
              <p><strong>Kontak:</strong> {item.contactPhone || '-'} • {item.contactEmail || '-'}</p>

              <hr />
              <h6>Dokumen</h6>
              {item.files && item.files.length > 0 ? (
                <div className="list-group">
                  {item.files.map((f, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{f.name}</strong>
                        <div className="small text-muted">{f.type || 'file'}</div>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => downloadFileFromBase64(f.name, f.base64)}>Download</button>
                        {f.cid && <a className="btn btn-sm btn-outline-secondary" href={`https://ipfs.io/ipfs/${f.cid}`} target="_blank" rel="noreferrer">Open CID</a>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small">Tidak ada dokumen terlampir.</div>
              )}
            </div>

            <div className="col-md-4 text-center">
              <QRCode value={JSON.stringify({hash: item.hash})} size={160} />
              <p className="small mt-2">Hash: {item.hash}</p>
              <p className="small text-muted">Status: {item.status}</p>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-success" onClick={() => handleDecision(true)}>ACC</button>
            <button className="btn btn-danger" onClick={() => handleDecision(false)}>Gagal</button>
            <button className="btn btn-outline-danger" onClick={() => {
              if (typeof onDelete === 'function') onDelete(item.hash);
            }}>Hapus (lokal)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulatorDetail;
