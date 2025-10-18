// frontend/src/App.jsx

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getFinalHash } from './utils/hashing';
import { CONTRACT_ADDRESS, CONTRACT_ABI, REGULATOR_ADDRESS } from './contractConfig';
// Pastikan RPC URL di handleVerificationCheck juga diganti!

const initialFormData = {
  nomorIzin: '',
  tglPenerbitan: '',
  namaUsaha: '',
  jenisPerizinan: 'IUMK'
};

const App = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [walletAddress, setWalletAddress] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: 'info', text: 'Hubungkan MetaMask untuk memulai...' });
  const [isRegulator, setIsRegulator] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [umkmContract, setUmkmContract] = useState(null);
  
  // RPC URL untuk fungsi View (Ganti dengan API Key Anda yang sebenarnya)
  const SEPOLIA_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/[PASTE API KEY ANDA DI SINI]'; 
  
  // Chain ID Sepolia adalah 11155111 (atau 0xaa36a7 dalam hex)
  const SEPOLIA_CHAIN_ID = '0xaa36a7'; 


  // --- FUNGSI KONEKSI WALLET & FORCE SWITCH JARINGAN ---
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatusMessage({ type: 'danger', text: "❌ MetaMask tidak terdeteksi." });
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Memaksa MetaMask untuk beralih ke Sepolia
      try {
          await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SEPOLIA_CHAIN_ID }], 
          });
      } catch (switchError) {
          // Error jika Sepolia belum ada di daftar jaringan user, minta user menambahkannya
          if (switchError.code === 4902) {
            setStatusMessage({ type: 'danger', text: "❌ Sepolia tidak ditemukan. Harap tambahkan secara manual di MetaMask." });
            return;
          }
          // Jika error lain, asumsikan user menolak switch
          setStatusMessage({ type: 'danger', text: "❌ Gagal beralih jaringan. Pastikan Anda memilih Sepolia." });
          return;
      }
      
      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedAddress = accounts[0];
      
      setWalletAddress(connectedAddress);
      
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setUmkmContract(contractInstance);

      // Cek Peran Regulator
      setIsRegulator(connectedAddress.toLowerCase() === REGULATOR_ADDRESS.toLowerCase());

      setStatusMessage({ type: 'success', text: `✅ Wallet Terhubung ke Sepolia: ${connectedAddress.substring(0, 6)}...${connectedAddress.substring(38)}` });
    } catch (error) {
      setStatusMessage({ type: 'danger', text: "❌ Koneksi Wallet Gagal." });
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIKA DAFTAR ASET (TRANSAKSI WRITE) ---
  const handleRegister = async () => {
    if (!umkmContract) return;
    
    try {
      setStatusMessage({ type: 'info', text: 'Menghitung Hash dan menunggu konfirmasi MetaMask...' });
      const finalHash = getFinalHash(formData); 
      
      const tx = await umkmContract.registerAsset(finalHash, formData.jenisPerizinan);
      
      setStatusMessage({ type: 'warning', text: `Transaksi dikirim (${tx.hash.substring(0, 10)}...). Menunggu konfirmasi blok...` });
      
      await tx.wait(); 
      setStatusMessage({ type: 'success', text: "✅ REGISTRASI SUKSES! NFT Sertifikat diterbitkan." });
      setFormData(initialFormData); 
    } catch (error) {
      setStatusMessage({ type: 'danger', text: "❌ REGISTRASI GAGAL. Cek konsol (Saldo tETH atau MetaMask)." });
      console.error("Kesalahan Registrasi:", error);
    }
  };

  // --- LOGIKA VERIFIKASI INSTAN (READ) ---
  const handleVerificationCheck = async () => {
    if (!formData.nomorIzin || !formData.namaUsaha) {
        setStatusMessage({ type: 'warning', text: "Isi form registrasi untuk diverifikasi." });
        return;
    }

    try {
        const hashToVerify = getFinalHash(formData);
        
        // Provider read-only (Gas Fee NOL) menggunakan RPC URL dari Alchemy/Infura
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const assetData = await readContract.getAssetDataByHash(hashToVerify);
        
        if (assetData.owner === ethers.ZeroAddress) {
            setVerificationResult({ success: false, reason: "HASH TIDAK TERDAFTAR atau DIMODIFIKASI." });
        } else {
            setVerificationResult({
                success: true,
                isVerified: assetData.isVerified,
                owner: assetData.owner,
                reason: assetData.reason,
                assetType: assetData.assetType
            });
        }
        setStatusMessage({ type: 'info', text: 'Verifikasi instan selesai.' });
    } catch (error) {
        setStatusMessage({ type: 'danger', text: "❌ Verifikasi gagal. Cek koneksi RPC Anda." });
        console.error("Kesalahan Verifikasi:", error);
    }
  };
  
  // --- LOGIKA REGULATOR ACTION ---
  const handleRegulatorAction = async (actionType) => {
      // Logic mengambil Token ID dari prompt, ini untuk demo cepat
      const tokenId = prompt("Masukkan Token ID yang ingin diubah (misal: 1, 2, 3):");
      if (!tokenId || isNaN(tokenId)) return;
      
      try {
          let reason = prompt(`Masukkan alasan untuk ${actionType}:`);
          if (!reason) return;
          
          let tx;
          if (actionType === 'VERIFY') {
              tx = await umkmContract.setVerifiedStatus(tokenId, reason);
          } else if (actionType === 'REVOKE') {
              tx = await umkmContract.revokeAsset(tokenId, reason);
          }
          
          setStatusMessage({ type: 'warning', text: `Transaksi ${actionType} dikirim. Menunggu konfirmasi...` });
          await tx.wait();
          setStatusMessage({ type: 'success', text: `✅ Status Aset #${tokenId} berhasil diubah oleh Regulator.` });

      } catch (error) {
          setStatusMessage({ type: 'danger', text: "❌ Aksi Regulator gagal. Pastikan Anda punya REGULATOR_ROLE." });
          console.error(error);
      }
  };


  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">🏛️ UMKMChain</h1>
        <p className="lead text-muted">Digital Rights & Authentication Platform</p>
        
        {/* Status Message */}
        <div className={`alert alert-${statusMessage.type} mt-3`} role="alert">
          {statusMessage.text}
        </div>
      </div>

      <div className="row g-4">
        {/* Kolom 1: Koneksi & Registrasi UMKM */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📝 Pendaftaran Aset (Role: UMKM)</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <button 
                  className={`btn w-100 btn-lg ${walletAddress ? 'btn-success' : 'btn-warning'}`} 
                  onClick={connectWallet} 
                  disabled={!!walletAddress}
                >
                  {walletAddress ? `✅ ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : '🦊 Hubungkan MetaMask'}
                </button>
              </div>

              {/* Form Input yang Menggunakan Class Bootstrap */}
              <div className="mb-3">
                <label className="form-label fw-bold">Nomor Izin</label>
                <input name="nomorIzin" className="form-control" onChange={handleInputChange} value={formData.nomorIzin} placeholder="cth: 4321/IUMK/2025" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Tanggal Terbit</label>
                <input name="tglPenerbitan" type="date" className="form-control" onChange={handleInputChange} value={formData.tglPenerbitan} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Nama Usaha</label>
                <input name="namaUsaha" className="form-control" onChange={handleInputChange} value={formData.namaUsaha} placeholder="cth: PT Kopi Rakyat Sentosa" />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Jenis Perizinan</label>
                <select name="jenisPerizinan" className="form-select" onChange={handleInputChange} value={formData.jenisPerizinan}>
                  <option value="IUMK">Izin Usaha Mikro Kecil (IUMK)</option>
                  <option value="SertTanah">Sertifikat Tanah</option>
                  <option value="Halal">Sertifikat Halal</option>
                </select>
              </div>
              
              <button 
                className="btn btn-primary w-100 btn-lg" 
                onClick={handleRegister} 
                disabled={!walletAddress || !formData.nomorIzin || !formData.namaUsaha}
              >
                🚀 DAFTAR ASET & Mint NFT
              </button>
            </div>
          </div>
        </div>

        {/* Kolom 2: Verifikasi & Regulator */}
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header bg-info text-dark">
              <h5 className="mb-0">🔍 Cek Legalitas (Role: Lembaga Keuangan)</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Masukkan data yang sama persis seperti pendaftaran untuk verifikasi Hash dan status aset.</p>
              <button 
                className="btn btn-info w-100 btn-lg" 
                onClick={handleVerificationCheck}
                disabled={!formData.nomorIzin}
              >
                ✓ VERIFIKASI INSTAN
              </button>
              
              {verificationResult && (
                  <div className={`mt-3 p-3 border rounded ${verificationResult.success ? 'border-success bg-light' : 'border-danger bg-light'}`}>
                      <h6 className="fw-bold">{verificationResult.success ? '✅ HASH TERDAFTAR' : '❌ HASH TIDAK TERDAFTAR'}</h6>
                      {verificationResult.success && (
                          <>
                              <hr />
                              <p className="mb-2">
                                <strong>Status:</strong> 
                                <span className={`ms-2 badge ${verificationResult.isVerified ? 'bg-success' : 'bg-warning'}`}>
                                  {verificationResult.isVerified ? 'SAH & TERVERIFIKASI' : 'MENUNGGU/DICABUT'}
                                </span>
                              </p>
                              <p className="mb-2"><strong>Jenis Aset:</strong> {verificationResult.assetType}</p>
                              <p className="mb-2"><strong>Alasan:</strong> {verificationResult.reason}</p>
                              <p className="mb-0 small text-break"><strong>Pemilik:</strong> {verificationResult.owner}</p>
                          </>
                      )}
                  </div>
              )}
            </div>
          </div>

          {/* Kontrol Khusus Regulator */}
          {isRegulator && (
              <div className="card shadow border-warning mt-4">
                  <div className="card-header bg-dark text-white">
                      <h5 className="mb-0">⚖️ Kontrol Regulator</h5>
                  </div>
                  <div className="card-body bg-light">
                      <p className="text-dark fw-bold mb-3">🎯 Anda terdeteksi sebagai Regulator. Ubah status aset dengan memasukkan Token ID.</p>
                      <div className="d-grid gap-2">
                        <button 
                            className="btn btn-success" 
                            onClick={() => handleRegulatorAction('VERIFY')}
                        >
                            ✅ Set Status: SAH (Verifikasi)
                        </button>
                        <button 
                            className="btn btn-danger" 
                            onClick={() => handleRegulatorAction('REVOKE')}
                        >
                            ❌ Set Status: DICABUT (Expired)
                        </button>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;