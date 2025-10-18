// frontend/src/components/tabs/RegistrationTab.jsx

import React, { useState } from 'react';
import { getFinalHash } from '../../utils/hashing';

const initialFormData = {
  nomorIzin: '',
  tglPenerbitan: '',
  namaUsaha: '',
  jenisPerizinan: 'IUMK'
};

const RegistrationTab = ({ umkmContract, isConnected, setStatusMessage }) => {
    const [formData, setFormData] = useState(initialFormData);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        if (!umkmContract || !formData.nomorIzin || !formData.namaUsaha) {
             setStatusMessage({ type: 'warning', text: "Harap isi semua kolom atau hubungkan wallet." });
             return;
        }
        
        try {
            setStatusMessage({ type: 'info', text: 'Menghitung Hash dan menunggu konfirmasi MetaMask...' });
            const finalHash = getFinalHash(formData); 
            
            const tx = await umkmContract.registerAsset(finalHash, formData.jenisPerizinan);
            
            setStatusMessage({ type: 'warning', text: `Transaksi dikirim (${tx.hash.substring(0, 10)}...). Menunggu konfirmasi...` });
            await tx.wait(); 
            setStatusMessage({ type: 'success', text: "✅ REGISTRASI SUKSES! Aset legal Anda kini memiliki Sertifikat NFT (Token ID #1, 2, dst)." });
            setFormData(initialFormData); 
        } catch (error) {
            setStatusMessage({ type: 'danger', text: "❌ REGISTRASI GAGAL. Pastikan hash belum terdaftar dan tETH cukup." });
            console.error("Kesalahan Registrasi:", error);
        }
    };

    return (
        <div className="p-3">
            <h4 className="fw-bold">1. Pendaftaran Aset Baru (Role: UMKM)</h4>
            <p className="text-muted">Proses ini membuat Hash (sidik jari digital) dari data Anda dan mencatatnya On-Chain.</p>
            
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label">Nomor Izin</label>
                    <input name="nomorIzin" className="form-control" onChange={handleInputChange} value={formData.nomorIzin} placeholder="cth: 4321/IUMK/2025" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Tanggal Terbit</label>
                    <input name="tglPenerbitan" type="date" className="form-control" onChange={handleInputChange} value={formData.tglPenerbitan} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nama Usaha</label>
                    <input name="namaUsaha" className="form-control" onChange={handleInputChange} value={formData.namaUsaha} placeholder="PT Kopi Rakyat Sentosa" />
                </div>
                <div className="mb-4">
                    <label className="form-label">Jenis Perizinan</label>
                    <select name="jenisPerizinan" className="form-select" onChange={handleInputChange} value={formData.jenisPerizinan}>
                        <option value="IUMK">Izin Usaha Mikro Kecil (IUMK)</option>
                        <option value="SertTanah">Sertifikat Tanah</option>
                        <option value="Halal">Sertifikat Halal</option>
                    </select>
                </div>
                
                <button 
                    className="btn btn-primary w-100 btn-lg" 
                    onClick={handleRegister} 
                    disabled={!isConnected || !formData.nomorIzin || !formData.namaUsaha}
                >
                    🚀 DAFTAR ASET & Mint NFT
                </button>
            </div>
        </div>
    );
};

export default RegistrationTab;