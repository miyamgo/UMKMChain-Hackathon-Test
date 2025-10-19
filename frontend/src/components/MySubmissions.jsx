import React, { useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const MySubmissions = ({ submissions, onDownload, onImport }) => {
  const fileRef = useRef();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umkm_submissions_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof onImport === 'function') onImport(parsed);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(f);
  };
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">My Submissions</h4>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={handleExport}>Export JSON</button>
          <button className="btn btn-outline-primary me-2" onClick={() => fileRef.current.click()}>Import JSON</button>
          <input ref={fileRef} type="file" accept="application/json" className="d-none" onChange={handleFile} />
        </div>
      </div>
      {submissions.length === 0 ? (
        <div className="alert alert-info">Belum ada pengajuan.</div>
      ) : (
        <div className="row g-3">
          {submissions.map((s) => {
            // try to get decision reason from the submission itself, else fallback to audit_log
            let displayReason = s.decisionReason;
            if (!displayReason) {
              try {
                const raw = localStorage.getItem('audit_log') || '[]';
                const arr = JSON.parse(raw);
                const found = arr.find(a => a.action === 'REJECT' && a.hash === s.hash);
                if (found && found.reason) displayReason = found.reason;
              } catch (e) { /* ignore */ }
            }

            return (
              <div key={s.hash} className="col-md-4">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6 className="fw-bold">{s.namaUsaha}</h6>
                    <p className="small text-muted">{s.nomorIzin}</p>
                    <div className="mb-2">
                      <span className={`badge ${s.status === 'APPROVED' ? 'bg-success' : s.status === 'REJECTED' ? 'bg-danger' : 'bg-secondary'}`}>{s.status || 'PENDING'}</span>
                      {s.status === 'REJECTED' && displayReason ? (
                        <div className="small text-danger mt-1">Alasan: {displayReason}</div>
                      ) : s.status === 'REJECTED' ? (
                        <div className="small text-muted mt-1">Alasan: -</div>
                      ) : null}
                    </div>
                    <div className="small text-muted mb-1">Hash: {s.hash}</div>
                    <div className="small text-muted mb-2">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</div>
                    <div className="mb-2">
                      <QRCode value={JSON.stringify({hash: s.hash})} size={120} />
                    </div>
                    <div className="small text-muted mb-2">Files: {s.files ? s.files.map(f => f.name).join(', ') : '—'}</div>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary" onClick={() => onDownload(s)}>Download File</button>
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
