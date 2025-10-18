import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getFinalHash } from './utils/hashing';
import { CONTRACT_ADDRESS, CONTRACT_ABI, REGULATOR_ADDRESS } from './contractConfig';

const initialFormData = {
  nomorIzin: '',
  tglPenerbitan: '',
  namaUsaha: '',
  jenisPerizinan: 'IUMK'
};

const App = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [walletAddress, setWalletAddress] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ 
    type: 'info', 
    text: 'Hubungkan MetaMask untuk memulai...' 
  });
  const [isRegulator, setIsRegulator] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [umkmContract, setUmkmContract] = useState(null);

  // Fungsi Koneksi Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatusMessage({ type: 'danger', text: "❌ MetaMask tidak terdeteksi. Install MetaMask terlebih dahulu." });
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedAddress = accounts[0];
      
      setWalletAddress(connectedAddress);
      
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setUmkmContract(contractInstance);

      // Cek Peran Regulator
      setIsRegulator(connectedAddress.toLowerCase() === REGULATOR_ADDRESS.toLowerCase());

      setStatusMessage({ 
        type: 'success', 
        text: `✅ Wallet Terhubung: ${connectedAddress.substring(0, 6)}...${connectedAddress.substring(38)}` 
      });
    } catch (error) {
      setStatusMessage({ 
        type: 'danger', 
        text: "❌ Koneksi Wallet Gagal. Pastikan di jaringan Sepolia." 
      });
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIKA DAFTAR ASET (WRITE)
  const handleRegister = async () => {
    if (!umkmContract) {
      setStatusMessage({ type: 'warning', text: '⚠️ Hubungkan wallet terlebih dahulu!' });
      return;
    }
    
    try {
      setStatusMessage({ 
        type: 'info', 
        text: '⏳ Menghitung Hash dan menunggu konfirmasi MetaMask...' 
      });
      
      const finalHash = getFinalHash(formData); 
      console.log("Hash yang dikirim:", finalHash);
      
      const tx = await umkmContract.registerAsset(finalHash, formData.jenisPerizinan);
      
      setStatusMessage({ 
        type: 'warning', 
        text: `📡 Transaksi dikirim (${tx.hash.substring(0, 10)}...). Menunggu konfirmasi blok...` 
      });
      
      await tx.wait(); 
      
      setStatusMessage({ 
        type: 'success', 
        text: "✅ REGISTRASI SUKSES! NFT Sertifikat telah diterbitkan." 
      });
      
      setFormData(initialFormData); 
    } catch (error) {
      setStatusMessage({ 
        type: 'danger', 
        text: "❌ REGISTRASI GAGAL. Cek konsol browser untuk detail error." 
      });
      console.error("Kesalahan Registrasi:", error);
    }
  };

  // LOGIKA VERIFIKASI INSTAN (READ)
  const handleVerificationCheck = async () => {
    try {
        setStatusMessage({ type: 'info', text: '🔍 Memverifikasi hash...' });
        
        const hashToVerify = getFinalHash(formData);
        console.log("Hash untuk verifikasi:", hashToVerify);
        
        // Pakai provider dari MetaMask yang udah connect
        const provider = new ethers.BrowserProvider(window.ethereum);
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const assetData = await readContract.getAssetDataByHash(hashToVerify);
        
        if (assetData.owner === ethers.ZeroAddress) {
            setVerificationResult({ 
              success: false, 
              reason: "HASH TIDAK TERDAFTAR atau DATA DIMODIFIKASI" 
            });
            setStatusMessage({ type: 'warning', text: '⚠️ Hash tidak ditemukan di blockchain' });
        } else {
            setVerificationResult({
                success: true,
                isVerified: assetData.isVerified,
                owner: assetData.owner,
                reason: assetData.reason,
                assetType: assetData.assetType,
                timestamp: assetData.timestamp
            });
            setStatusMessage({ type: 'success', text: '✅ Verifikasi selesai' });
        }
    } catch (error) {
        setStatusMessage({ 
          type: 'danger', 
          text: "❌ Verifikasi gagal. Pastikan wallet terhubung dan di jaringan Sepolia." 
        });
        console.error("Kesalahan Verifikasi:", error);
    }
  };
  
  // KOMPONEN UNTUK REGULATOR
  const handleRegulatorAction = async (actionType) => {
      const tokenId = prompt("Masukkan Token ID yang ingin diubah (misal: 1):");
      if (!tokenId) return;
      
      try {
          let reason = prompt(`Masukkan alasan untuk ${actionType}:`);
          if (!reason) return;
          
          setStatusMessage({ 
            type: 'info', 
            text: `⏳ Menunggu konfirmasi transaksi ${actionType}...` 
          });
          
          let tx;
          if (actionType === 'VERIFY') {
              tx = await umkmContract.setVerifiedStatus(tokenId, reason);
          } else if (actionType === 'REVOKE') {
              tx = await umkmContract.revokeAsset(tokenId, reason);
          }
          
          setStatusMessage({ 
            type: 'warning', 
            text: `📡 Transaksi ${actionType} dikirim. Menunggu konfirmasi...` 
          });
          
          await tx.wait();
          
          setStatusMessage({ 
            type: 'success', 
            text: `✅ Status Aset #${tokenId} berhasil diubah oleh Regulator.` 
          });

      } catch (error) {
          setStatusMessage({ 
            type: 'danger', 
            text: "❌ Aksi Regulator gagal. Pastikan Anda punya tETH dan memiliki role Regulator." 
          });
          console.error("Error Regulator Action:", error);
      }
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">🏛️ UMKMChain</h1>
        <p className="lead text-muted">Digital Rights & Authentication Platform</p>
        <p className="text-muted small">Powered by Blockchain Technology</p>
        
        <div className={`alert alert-${statusMessage.type} mt-3`} role="alert">
          {statusMessage.text}
        </div>
      </div>

      <div className="row g-4">
        {/* Kolom 1: Pendaftaran UMKM */}
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📝 Pendaftaran Aset (Role: UMKM)</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <button 
                  className={`btn w-100 ${walletAddress ? 'btn-success' : 'btn-warning'}`} 
                  onClick={connectWallet} 
                  disabled={!!walletAddress}
                >
                  {walletAddress 
                    ? `✅ ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` 
                    : '🦊 Hubungkan MetaMask'}
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Nomor Izin</label>
                <input 
                  name="nomorIzin" 
                  className="form-control" 
                  onChange={handleInputChange} 
                  value={formData.nomorIzin} 
                  placeholder="Contoh: 4321/IUMK/2025" 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Tanggal Terbit</label>
                <input 
                  name="tglPenerbitan" 
                  type="date"
                  className="form-control" 
                  onChange={handleInputChange} 
                  value={formData.tglPenerbitan} 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Nama Usaha</label>
                <input 
                  name="namaUsaha" 
                  className="form-control" 
                  onChange={handleInputChange} 
                  value={formData.namaUsaha} 
                  placeholder="Contoh: PT Kopi Rakyat Sentosa" 
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-bold">Jenis Perizinan</label>
                <select 
                  name="jenisPerizinan" 
                  className="form-select" 
                  onChange={handleInputChange} 
                  value={formData.jenisPerizinan}
                >
                  <option value="IUMK">Izin Usaha Mikro Kecil (IUMK)</option>
                  <option value="SertTanah">Sertifikat Tanah</option>
                  <option value="Halal">Sertifikat Halal</option>
                  <option value="NIB">Nomor Induk Berusaha (NIB)</option>
                </select>
              </div>
              
              <button 
                className="btn btn-primary w-100 btn-lg fw-bold" 
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
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">🔍 Cek Legalitas (Role: Publik)</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Masukkan data yang <strong>sama persis</strong> seperti pendaftaran untuk verifikasi.
              </p>
              <button 
                className="btn btn-info w-100 btn-lg fw-bold" 
                onClick={handleVerificationCheck}
                disabled={!formData.nomorIzin || !formData.namaUsaha}
              >
                ✓ VERIFIKASI INSTAN
              </button>
              
              {verificationResult && (
                  <div className={`mt-4 p-4 border rounded-3 ${verificationResult.success ? 'border-success bg-light' : 'border-danger bg-light'}`}>
                      <h5 className="fw-bold mb-3">
                        {verificationResult.success ? '✅ HASH TERDAFTAR' : '❌ HASH TIDAK TERDAFTAR'}
                      </h5>
                      
                      {verificationResult.success ? (
                          <>
                              <hr />
                              <div className="mb-3">
                                <strong>Status Verifikasi:</strong> 
                                <span className={`ms-2 badge fs-6 ${verificationResult.isVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {verificationResult.isVerified ? 'SAH & TERVERIFIKASI ✓' : 'MENUNGGU/DICABUT ⏳'}
                                </span>
                              </div>
                              
                              <p className="mb-2">
                                <strong>Jenis Aset:</strong> 
                                <span className="badge bg-primary ms-2">{verificationResult.assetType}</span>
                              </p>
                              
                              <p className="mb-2">
                                <strong>Alasan Status:</strong> {verificationResult.reason}
                              </p>
                              
                              <p className="mb-2">
                                <strong>Timestamp:</strong> {new Date(Number(verificationResult.timestamp) * 1000).toLocaleString('id-ID')}
                              </p>
                              
                              <p className="mb-0 small text-break">
                                <strong>Pemilik (Owner):</strong><br/>
                                <code>{verificationResult.owner}</code>
                              </p>
                          </>
                      ) : (
                          <p className="text-danger mb-0">
                            Data tidak ditemukan di blockchain atau telah dimodifikasi.
                          </p>
                      )}
                  </div>
              )}
            </div>
          </div>

          {/* Kontrol Regulator */}
          {isRegulator && (
              <div className="card shadow-lg border-warning">
                  <div className="card-header bg-dark text-white">
                      <h5 className="mb-0">⚖️ Kontrol Regulator</h5>
                  </div>
                  <div className="card-body bg-light">
                      <div className="alert alert-warning mb-3">
                        <strong>🎯 Mode Regulator Aktif</strong><br/>
                        Anda memiliki akses untuk mengubah status aset.
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button 
                            className="btn btn-success btn-lg fw-bold" 
                            onClick={() => handleRegulatorAction('VERIFY')}
                        >
                            ✅ Set Status: SAH
                        </button>
                        <button 
                            className="btn btn-danger btn-lg fw-bold" 
                            onClick={() => handleRegulatorAction('REVOKE')}
                        >
                            ❌ Set Status: DICABUT
                        </button>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-5 text-muted">
        <p className="mb-0">
          <small>© 2025 UMKMChain | Sepolia Testnet | Made with ❤️</small>
        </p>
      </div>
    </div>
  );
};

export default App;