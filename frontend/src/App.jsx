import React, { useState } from 'react';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { getFinalHash } from './utils/hashing';
import { CONTRACT_ADDRESS, CONTRACT_ABI, REGULATOR_ADDRESS } from './contractConfig';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Verify from './components/Verify';
import UMKMRegister from './components/UMKMRegister';
import MySubmissions from './components/MySubmissions';
import RegulatorList from './components/RegulatorList';
import RegulatorDetail from './components/RegulatorDetail';
import AdminPurge from './components/AdminPurge';

const initialFormData = {
  nomorIzin: '',
  tglPenerbitan: '',
  namaUsaha: '',
  jenisPerizinan: 'IUMK'
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState(initialFormData);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isRegulator, setIsRegulator] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [umkmContract, setUmkmContract] = useState(null);
  const [latestTokenId, setLatestTokenId] = useState(0);
  const [latestHash, setLatestHash] = useState('');

  // App-level user and submissions (local simulation / persisted in localStorage)
  const [user, setUser] = useState(null); // {address, role, name}
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('umkm_submissions');
      if (raw) setSubmissions(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask tidak terdeteksi!");
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

      setIsRegulator(connectedAddress.toLowerCase() === REGULATOR_ADDRESS.toLowerCase());

      toast.success(`Wallet terhubung: ${connectedAddress.substring(0, 10)}...`);
    } catch (error) {
      toast.error("Koneksi Wallet Gagal");
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!umkmContract) {
      toast.warning('Hubungkan wallet terlebih dahulu!');
      return;
    }
    
    const loadingToast = toast.loading('Menunggu konfirmasi MetaMask...');
    
    try {
      const finalHash = getFinalHash(formData); 
      setLatestHash(finalHash);
      
      const tx = await umkmContract.registerAsset(finalHash, formData.jenisPerizinan);
      
      toast.update(loadingToast, {
        render: 'Transaksi dikirim. Menunggu konfirmasi...',
        type: 'info',
        isLoading: true
      });
      
      const receipt = await tx.wait(); 
      
      const transferEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );
      
      if (transferEvent) {
        const tokenId = parseInt(transferEvent.topics[3], 16);
        setLatestTokenId(tokenId);
        
        toast.update(loadingToast, {
          render: `✅ REGISTRASI SUKSES! Token ID: #${tokenId}`,
          type: 'success',
          isLoading: false,
          autoClose: 5000
        });
      }
      
      setFormData(initialFormData); 
    } catch (error) {
      toast.update(loadingToast, {
        render: '❌ REGISTRASI GAGAL',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
      console.error("Kesalahan Registrasi:", error);
    }
  };

  const handleVerificationCheck = async () => {
    const loadingToast = toast.loading('Memverifikasi hash...');
    
    try {
        const hashToVerify = getFinalHash(formData);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const assetData = await readContract.getAssetDataByHash(hashToVerify);
        
        if (assetData.owner === ethers.ZeroAddress) {
            setVerificationResult({ 
              success: false, 
              reason: "HASH TIDAK TERDAFTAR" 
            });
            toast.update(loadingToast, {
              render: 'Hash tidak ditemukan',
              type: 'warning',
              isLoading: false,
              autoClose: 3000
            });
        } else {
            setVerificationResult({
                success: true,
                isVerified: assetData.isVerified,
                owner: assetData.owner,
                reason: assetData.reason,
                assetType: assetData.assetType,
                timestamp: assetData.timestamp
            });
            toast.update(loadingToast, {
              render: '✅ Verifikasi selesai',
              type: 'success',
              isLoading: false,
              autoClose: 3000
            });
        }
    } catch (error) {
        toast.update(loadingToast, {
          render: 'Verifikasi gagal',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
        console.error("Kesalahan Verifikasi:", error);
    }
  };
  
  const handleRegulatorAction = async (actionType) => {
    // Accept either tokenId or hash from prompt
    const input = prompt("Masukkan Token ID atau Hash (misal: 1 atau 0xabc...):");
    if (!input) return;

    const reason = prompt(`Masukkan alasan untuk ${actionType}:`);
    if (!reason) return;

    const loadingToast = toast.loading(`Menunggu konfirmasi ${actionType}...`);

    try {
      let tokenId = null;

      // If the input looks like a number, use it
      if (/^[0-9]+$/.test(input.trim())) {
        tokenId = parseInt(input.trim());
      } else {
        // treat as hash: try to resolve via contract getter
        if (!umkmContract) {
          toast.update(loadingToast, { render: 'Koneksi kontrak diperlukan untuk resolve hash', type: 'error', isLoading: false, autoClose: 3000 });
          return;
        }
        try {
          const found = await umkmContract.getTokenIdByHash(input.trim());
          tokenId = Number(found || 0);
          if (!tokenId) {
            toast.update(loadingToast, { render: 'Hash tidak ditemukan di kontrak', type: 'error', isLoading: false, autoClose: 3000 });
            return;
          }
        } catch (e) {
          toast.update(loadingToast, { render: 'Gagal resolve hash ke tokenId', type: 'error', isLoading: false, autoClose: 3000 });
          return;
        }
      }

      // perform on-chain action
      let tx;
      if (actionType === 'VERIFY') tx = await umkmContract.setVerifiedStatus(tokenId, reason);
      else tx = await umkmContract.revokeAsset(tokenId, reason);

      await tx.wait();
      toast.update(loadingToast, { render: `✅ Status Aset #${tokenId} berhasil diubah`, type: 'success', isLoading: false, autoClose: 5000 });
    } catch (error) {
      toast.update(loadingToast, { render: 'Aksi Regulator gagal', type: 'error', isLoading: false, autoClose: 5000 });
      console.error('Error Regulator Action:', error);
    }
  };

  // Simple login (from Login component)
  const handleLogin = (u) => {
    setUser(u);
    setIsRegulator(u.role === 'regulator');
    // route based on role
    if (u.role === 'regulator') setCurrentPage('regulatorList');
    else setCurrentPage('register');
  };

  // --- Local submissions handling (client-side storage) ---
  const loadSubmissions = () => {
    try {
      const raw = localStorage.getItem('umkm_submissions');
      if (raw) setSubmissions(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load submissions', e);
    }
  };

  const saveSubmissions = (list) => {
    setSubmissions(list);
    try { localStorage.setItem('umkm_submissions', JSON.stringify(list)); } catch (e) {}
  };

  const handleRegisterLocal = (payload) => {
    // payload includes hash and form fields
    const item = { ...payload, status: 'PENDING' };
    const next = [item, ...submissions];
    saveSubmissions(next);
    toast.success('Pengajuan disimpan (local)');
    setCurrentPage('mySubmissions');
  };

  const handleDownloadPdf = (item) => {
    const content = `UMKM Registration\nNama Usaha: ${item.namaUsaha}\nNomor Izin: ${item.nomorIzin}\nHash: ${item.hash}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umkm_${item.hash.substring(2,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmissions = (newList) => {
    try {
      saveSubmissions(Array.isArray(newList) ? newList : []);
      toast.success('Submissions imported successfully');
      setCurrentPage('mySubmissions');
    } catch (e) {
      toast.error('Import failed');
    }
  };

  const handleRegulatorDecision = (item, approved, reason) => {
    const next = submissions.map(s => s.hash === item.hash ? { ...s, status: approved ? 'APPROVED' : 'REJECTED', decidedBy: user?.name || user?.address, decidedAt: Date.now(), decisionReason: reason || '' } : s);
    saveSubmissions(next);
    toast.success(`Submission ${approved ? 'ACC' : 'Gagal'}: ${item.namaUsaha}`);
    setSelectedSubmission(null);
    setCurrentPage('regulatorList');
  };

  const handleDeleteSubmission = (hash) => {
    if (!confirm('Yakin ingin menghapus pengajuan ini secara lokal? Tindakan ini tidak bisa di-undo.')) return;
    const next = submissions.filter(s => s.hash !== hash);
    saveSubmissions(next);
    try {
      const raw = localStorage.getItem('audit_log') || '[]';
      const arr = JSON.parse(raw);
      arr.unshift({ action: 'DELETE_LOCAL', by: user?.address || user?.name || 'unknown', hash, at: Date.now() });
      localStorage.setItem('audit_log', JSON.stringify(arr));
    } catch (e) {}
    toast.success('Pengajuan dihapus (lokal)');
    setSelectedSubmission(null);
    setCurrentPage('regulatorList');
  };

  // Render based on current page and role
  const renderPage = () => {
    if (!user) {
      return renderHomePage();
    }

    if (user.role === 'umkm') {
  if (currentPage === 'register') return <UMKMRegister onRegister={handleRegisterLocal} />;
  if (currentPage === 'mySubmissions') return <MySubmissions submissions={submissions} onDownload={handleDownloadPdf} onImport={handleImportSubmissions} />;
      return renderHomePage();
    }

    if (user.role === 'regulator') {
      if (currentPage === 'regulatorList') return <RegulatorList submissions={submissions} onOpen={(s) => { setSelectedSubmission(s); setCurrentPage('regulatorDetail'); }} user={user} onDelete={handleDeleteSubmission} />;
      if (currentPage === 'regulatorDetail') return <RegulatorDetail item={selectedSubmission} onDecision={handleRegulatorDecision} user={user} onDelete={handleDeleteSubmission} />;
      if (currentPage === 'adminPurge') return <AdminPurge onReload={loadSubmissions} />;
    }

    return renderHomePage();
  };

  const renderHomePage = () => (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-6">
          <Verify onCheck={async (hash) => {
            // check local submissions first
            const found = submissions.find(s => s.hash === hash);
            if (found) {
              toast.info(`Ditemukan - status: ${found.status}`);
              return;
            }
            // fallback to on-chain if contract available
            if (umkmContract) {
              try {
                const asset = await umkmContract.getAssetDataByHash(hash);
                if (asset.owner && asset.owner !== ethers.ZeroAddress) {
                  toast.success(`On-chain: ${asset.isVerified ? 'SAH' : 'TIDAK SAH'}`);
                } else {
                  toast.warning('Hash tidak terdaftar (on-chain)');
                }
              } catch (e) {
                toast.error('Verifikasi on-chain gagal');
              }
            } else {
              toast.warning('Tidak ditemukan di local dan tidak ada koneksi kontrak');
            }
          }} />
        </div>

        <div className="col-md-6">
          <Login onLogin={handleLogin} onConnectWallet={connectWallet} walletAddress={walletAddress} />
        </div>
      </div>
      <div className="text-center mt-5 text-white">
        <p className="mb-0">
          <small>© 2025 UMKMChain | Made with ❤️</small>
        </p>
      </div>
    </div>
  );

  return (
  <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navbar 
        walletAddress={walletAddress}
        onConnect={connectWallet}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isRegulator={isRegulator}
        user={user}
        onLogout={() => { setUser(null); setIsRegulator(false); setCurrentPage('home'); }}
      />
      
      <div className="pb-5">
        {renderPage()}
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default App;