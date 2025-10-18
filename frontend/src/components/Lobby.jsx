// frontend/src/components/Lobby.jsx

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

// Import Komponen Tab
import RegistrationTab from './tabs/RegistrationTab';
import VerificationTab from './tabs/VerificationTab';
import MyAssetsTab from './tabs/MyAssetsTab';
import RegulatorTab from './tabs/RegulatorTab'; 

const tabData = [
    { id: 'register', name: '1. Pendaftaran', component: RegistrationTab },
    { id: 'myAssets', name: '2. Status Aset Saya', component: MyAssetsTab },
    { id: 'verify', name: '3. Verifikasi Instan', component: VerificationTab },
    { id: 'regulator', name: '4. Audit Regulator', component: RegulatorTab },
];

const Lobby = ({ userId, isRegulator }) => {
    const [activeTab, setActiveTab] = useState(isRegulator ? 'regulator' : 'register'); 
    const userRole = isRegulator ? 'Regulator' : 'UMKM';
    const [umkmContract, setUmkmContract] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: 'info', text: 'Kontrak sedang dimuat...' });
    const [isConnected, setIsConnected] = useState(false);
    const [formData, setFormData] = useState({
        nomorIzin: '',
        tglPenerbitan: '',
        namaUsaha: '',
        jenisPerizinan: 'IUMK'
    });

    useEffect(() => {
        const initContract = async () => {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                
                setUmkmContract(contractInstance);
                setIsConnected(true);
                setStatusMessage({ type: 'success', text: `Wallet siap berinteraksi sebagai ${userRole}.` });
            } catch (error) {
                setStatusMessage({ type: 'danger', text: 'Gagal menginisialisasi kontrak. Coba refresh.' });
            }
        };
        initContract();
    }, [userId]); // Hanya inisialisasi ketika user ID berubah (setelah login)
    
    // Fungsi yang akan mengubah state form dan diteruskan ke semua tab
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const renderTabContent = () => {
        const ActiveComponent = tabData.find(tab => tab.id === activeTab).component;
        
        return (
            <div className="mt-4">
                <ActiveComponent 
                    umkmContract={umkmContract} 
                    userId={userId} 
                    isRegulator={isRegulator}
                    formData={formData} // Kirimkan formData ke tab
                    setFormData={setFormData} // Kirimkan fungsi untuk update formData
                    setStatusMessage={setStatusMessage} // Untuk feedback ke user
                    isConnected={isConnected}
                />
            </div>
        );
    };

    // Filter tab: Sembunyikan Audit Regulator jika bukan Regulator
    const filteredTabs = isRegulator 
        ? tabData 
        : tabData.filter(tab => tab.id !== 'regulator');

    return (
        <div className="container my-5">
            <h1 className="text-center display-5 fw-bold mb-1">🏛️ UMKMChain Lobby</h1>
            <p className="text-center lead text-success">Logged in as {userRole} ({userId.substring(0, 8)}...)</p>
            
            <div className={`alert alert-${statusMessage.type} mt-3 mb-4`} role="alert">
                {statusMessage.text}
            </div>

            {/* Navigasi Tabs (Pills) */}
            <ul className="nav nav-pills nav-fill mb-4">
                {filteredTabs.map(tab => (
                    <li className="nav-item" key={tab.id}>
                        <button 
                            className={`nav-link fw-bold ${activeTab === tab.id ? (tab.id === 'regulator' ? 'active bg-dark' : 'active bg-primary') : 'bg-light text-dark'}`} 
                            onClick={() => setActiveTab(tab.id)}
                            disabled={!isConnected}
                        >
                            {tab.name}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Konten Tab Aktif */}
            <div className="tab-content border p-4 shadow-sm bg-white">
                {/* Kolom input form yang digunakan bersama-sama oleh tab */}
                {(activeTab === 'register' || activeTab === 'verify') && (
                    <div className="mb-4 p-3 border rounded bg-light">
                        <h6 className="fw-bold">DATA ASET UNTUK REGISTRASI/VERIFIKASI:</h6>
                        {/* PENTING: Form ini dikendalikan oleh state di Lobby dan di-share ke tab */}
                        <div className="row">
                            <div className="col-6 mb-2">
                                <label className="form-label small">Nomor Izin</label>
                                <input name="nomorIzin" className="form-control" onChange={handleInputChange} value={formData.nomorIzin} placeholder="cth: 4321/IUMK/2025" />
                            </div>
                            <div className="col-6 mb-2">
                                <label className="form-label small">Tanggal Terbit</label>
                                <input name="tglPenerbitan" type="date" className="form-control" onChange={handleInputChange} value={formData.tglPenerbitan} />
                            </div>
                            <div className="col-6 mb-2">
                                <label className="form-label small">Nama Usaha</label>
                                <input name="namaUsaha" className="form-control" onChange={handleInputChange} value={formData.namaUsaha} placeholder="PT Kopi Rakyat Sentosa" />
                            </div>
                            <div className="col-6 mb-2">
                                <label className="form-label small">Jenis Perizinan</label>
                                <select name="jenisPerizinan" className="form-select" onChange={handleInputChange} value={formData.jenisPerizinan}>
                                    <option value="IUMK">Izin Usaha Mikro Kecil (IUMK)</option>
                                    <option value="SertTanah">Sertifikat Tanah</option>
                                    <option value="Halal">Sertifikat Halal</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Lobby;