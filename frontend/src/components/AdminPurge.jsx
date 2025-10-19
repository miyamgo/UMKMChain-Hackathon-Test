import React, { useEffect, useState } from 'react';

const AdminPurge = ({ onReload }) => {
  const [submissions, setSubmissions] = useState([]);
  const [hash, setHash] = useState('');
  const [lastDeleted, setLastDeleted] = useState(null);

  useEffect(() => {
    load();
    try { const ld = JSON.parse(localStorage.getItem('last_deleted_submission') || 'null'); setLastDeleted(ld); } catch (e) {}
  }, []);

  const load = () => {
    try {
      const raw = localStorage.getItem('umkm_submissions') || '[]';
      const arr = JSON.parse(raw);
      setSubmissions(arr);
    } catch (e) { setSubmissions([]); }
  };

  const save = (arr) => {
    localStorage.setItem('umkm_submissions', JSON.stringify(arr));
    setSubmissions(arr);
    if (typeof onReload === 'function') onReload();
  };

  const deleteByHash = (h) => {
    if (!h) return alert('Masukkan hash terlebih dahulu');
    const found = submissions.find(s => s.hash === h);
    if (!found) return alert('Hash tidak ditemukan di local submissions');
    if (!confirm(`Hapus submission dengan hash ${h} ?`)) return;
    const next = submissions.filter(s => s.hash !== h);
    try { localStorage.setItem('last_deleted_submission', JSON.stringify(found)); } catch (e) {}
    save(next);
    alert('Dihapus (lokal). Anda bisa Undo dari bagian Undo Last Delete.');
  };

  const deleteAll = () => {
    if (!confirm('Hapus SEMUA submissions lokal? Tindakan ini tidak bisa di-undo unless you Export a backup.')) return;
    try {
      localStorage.setItem('last_deleted_submission', JSON.stringify({ bulk: true, items: submissions, at: Date.now() }));
    } catch (e) {}
    save([]);
    alert('Semua data lokal dihapus. Gunakan Undo jika perlu.');
  };

  const undoLast = () => {
    try {
      const raw = localStorage.getItem('last_deleted_submission');
      if (!raw) return alert('Tidak ada last deleted entry');
      const obj = JSON.parse(raw);
      if (obj.bulk) {
        save(obj.items || []);
      } else {
        const next = [obj, ...submissions];
        save(next);
      }
      localStorage.removeItem('last_deleted_submission');
      alert('Restore selesai');
    } catch (e) {
      alert('Restore gagal');
      console.error(e);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Admin Purge — Local Submissions</h4>
      <p className="text-muted">Hapus data lokal yang tersimpan di browser. Ini tidak mempengaruhi data on-chain.</p>

      <div className="card mb-3">
        <div className="card-body">
          <div className="mb-2">
            <label className="form-label">Delete by Hash</label>
            <div className="input-group">
              <input className="form-control" value={hash} onChange={e => setHash(e.target.value)} placeholder="0x..." />
              <button className="btn btn-danger" onClick={() => deleteByHash(hash)}>Delete</button>
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Bulk</label>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-danger" onClick={deleteAll}>Delete All Local</button>
              <button className="btn btn-outline-secondary" onClick={undoLast} disabled={!localStorage.getItem('last_deleted_submission')}>Undo Last Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Current Submissions ({submissions.length})</div>
        <div className="card-body" style={{ maxHeight: 360, overflow: 'auto' }}>
          {submissions.length === 0 ? <div className="text-muted">No submissions</div> : (
            <ul className="list-group">
              {submissions.map(s => (
                <li key={s.hash} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{s.namaUsaha}</strong>
                    <div className="small text-muted">{s.nomorIzin} • {s.namaPemilik}</div>
                    <div className="small">Hash: {s.hash}</div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteByHash(s.hash)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPurge;
