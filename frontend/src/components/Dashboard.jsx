import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats] = useState({
    totalAssets: 12,
    verified: 8,
    pending: 3,
    revoked: 1
  });

  const pieData = [
    { name: 'Verified', value: stats.verified, color: '#28a745' },
    { name: 'Pending', value: stats.pending, color: '#ffc107' },
    { name: 'Revoked', value: stats.revoked, color: '#dc3545' }
  ];

  const barData = [
    { name: 'Total', count: stats.totalAssets },
    { name: 'Verified', count: stats.verified },
    { name: 'Pending', count: stats.pending },
    { name: 'Revoked', count: stats.revoked }
  ];

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold">📊 Dashboard Analytics</h2>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-lg bg-primary text-white">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 opacity-75">Total Assets</h6>
              <h2 className="card-title fw-bold mb-0">{stats.totalAssets}</h2>
              <small>📦 Registered</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-lg bg-success text-white">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 opacity-75">Verified</h6>
              <h2 className="card-title fw-bold mb-0">{stats.verified}</h2>
              <small>✅ SAH</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-lg bg-warning text-dark">
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Pending</h6>
              <h2 className="card-title fw-bold mb-0">{stats.pending}</h2>
              <small>⏳ Waiting</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-lg bg-danger text-white">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 opacity-75">Revoked</h6>
              <h2 className="card-title fw-bold mb-0">{stats.revoked}</h2>
              <small>❌ Dicabut</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">📊 Status Distribution</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow">
            <div className="card-header bg-white">
              <h5 className="mb-0">📈 Asset Statistics</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card border-0 shadow">
        <div className="card-header bg-white">
          <h5 className="mb-0">🕐 Recent Activities</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Token ID</th>
                  <th>Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge bg-primary">Asset Registered</span></td>
                  <td>#12</td>
                  <td className="small">0xb5706...91c25</td>
                  <td className="small">2 mins ago</td>
                </tr>
                <tr>
                  <td><span className="badge bg-success">Verified</span></td>
                  <td>#11</td>
                  <td className="small">0xa1234...56789</td>
                  <td className="small">15 mins ago</td>
                </tr>
                <tr>
                  <td><span className="badge bg-primary">Asset Registered</span></td>
                  <td>#10</td>
                  <td className="small">0xc9876...12345</td>
                  <td className="small">1 hour ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;