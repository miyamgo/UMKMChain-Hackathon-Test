import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const Dashboard = ({ submissions, umkmContract }) => {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    revoked: 0, // Dihitung sebagai pending/tidak sah
  });

  const [chartData, setChartData] = useState({
    weekly: [],
    monthly: [],
  });

  useEffect(() => {
    const processData = async () => {
      if (!umkmContract || submissions.length === 0) {
        // Hitung statistik dasar jika tidak ada koneksi contract
        setStats({ total: submissions.length, verified: 0, pending: submissions.length, revoked: 0 });
        return;
      }
      
      try {
        // Ambil status on-chain untuk semua submission
        const promises = submissions.map(s => umkmContract.getAssetDataByHash(s.hash));
        const onChainResults = await Promise.all(promises);

        let verifiedCount = 0;
        let pendingCount = 0;

        onChainResults.forEach(result => {
          if (result.owner !== '0x0000000000000000000000000000000000000000') { // Pastikan hash terdaftar
             if (result.isVerified) {
              verifiedCount++;
            } else {
              pendingCount++;
            }
          }
        });

        setStats({
          total: submissions.length,
          verified: verifiedCount,
          pending: pendingCount,
          revoked: pendingCount, // Untuk sederhana, kita gabung
        });

        // Proses data untuk grafik
        const now = new Date();
        const weeklyData = Array(7).fill(0).map((_, i) => {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            return { name: d.toLocaleDateString('id-ID', { weekday: 'short' }), users: 0 };
        }).reverse();

        const monthlyData = Array(12).fill(0).map((_, i) => {
            return { name: new Date(0, i).toLocaleString('id-ID', { month: 'short' }), users: 0 };
        });

        submissions.forEach(s => {
            const subDate = new Date(s.createdAt);
            // Data Mingguan
            const diffDays = Math.floor((now - subDate) / (1000 * 60 * 60 * 24));
            if (diffDays < 7) {
                const dayIndex = 6 - diffDays;
                weeklyData[dayIndex].users++;
            }
            // Data Bulanan
            if (subDate.getFullYear() === now.getFullYear()) {
                const monthIndex = subDate.getMonth();
                monthlyData[monthIndex].users++;
            }
        });

        setChartData({ weekly: weeklyData, monthly: monthlyData });

      } catch (error) {
        console.error("Gagal memproses data dashboard:", error);
        toast.error("Gagal menyinkronkan data dashboard.");
      }
    };

    processData();
  }, [submissions, umkmContract]);


  const StatCard = ({ title, value, color }) => (
    <div className="col-md-3">
      <div className={`card border-0 shadow-sm text-white bg-${color}`}>
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text fs-2 fw-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold">📊 Dashboard Analytics</h2>
      
      <div className="row g-4 mb-4">
        <StatCard title="Total Aset Terdaftar" value={stats.total} color="primary" />
        <StatCard title="Aset Terverifikasi (SAH)" value={stats.verified} color="success" />
        <StatCard title="Menunggu / Dicabut" value={stats.pending} color="warning" />
        <StatCard title="Placeholder" value={0} color="secondary" />
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pendaftaran Baru (Mingguan)</h5>
               <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#8884d8" name="Pengguna Baru"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
           <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pendaftaran Baru (Bulanan)</h5>
               <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#82ca9d" name="Pengguna Baru"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

