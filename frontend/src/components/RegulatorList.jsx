import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#4e73df', '#20c997', '#f6c23e', '#e74a3b'];

const RegulatorList = ({ submissions, onOpen, user }) => {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q) return submissions;
    return submissions.filter(s => s.hash?.toLowerCase().includes(q.toLowerCase()));
  }, [submissions, q]);

  const statusCounts = useMemo(() => {
    const map = { PENDING: 0, APPROVED: 0, REJECTED: 0, OTHER: 0 };
    submissions.forEach(s => {
      const st = s.status || 'PENDING';
      if (map[st] !== undefined) map[st]++;
      else map.OTHER++;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [submissions]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Daftar Pengajuan</h4>
        <div className="small text-muted">Admin: {user?.name || user?.address}</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div style={{ height: 180, minHeight: 150, minWidth: 0 }}> 
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts} dataKey="value" nameKey="name" outerRadius={60} fill={COLORS[0]}>
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div style={{ height: 180, minHeight: 150, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {statusCounts.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="input-group mt-3">
            <input className="form-control" placeholder="Cari berdasarkan hash..." value={q} onChange={e => setQ(e.target.value)} />
            <button className="btn btn-outline-secondary" onClick={() => setQ('')}>Clear</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-info">Tidak ada pengajuan sesuai pencarian</div>
      ) : (
        <div className="list-group">
          {filtered.map(s => (
            <div key={s.hash} className="list-group-item d-flex justify-content-between align-items-center">
              <div style={{ cursor: 'pointer' }} onClick={() => onOpen(s)}>
                <strong>{s.namaUsaha}</strong>
                <div className="small text-muted">{s.nomorIzin} • {s.namaPemilik}</div>
                <div className="small text-muted">Hash: {s.hash?.substring(0,12)}...</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="small text-muted">{new Date(s.createdAt).toLocaleString()}</div>
                {typeof onDelete === 'function' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(s.hash)}>Hapus</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegulatorList;
