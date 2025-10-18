// frontend/src/components/tabs/MyAssetsTab.jsx

import React from 'react';

const MyAssetsTab = ({ userId }) => {
  return (
    <div className="p-3">
        <h4 className="fw-bold">2. Status Aset Saya (Owner: {userId ? userId.substring(0, 8) + '...' : 'N/A'})</h4>
        <p className="text-muted">Ini akan menampilkan daftar semua NFT Sertifikat yang dimiliki oleh wallet Anda.</p>
        <div className="alert alert-warning mt-3">
            Fitur ini memerlukan API tambahan (seperti Alchemy NFT API) untuk membaca kepemilikan. Untuk Hackathon, fokus pada Verifikasi Instan (Tab 3).
        </div>
    </div>
  );
};

export default MyAssetsTab;