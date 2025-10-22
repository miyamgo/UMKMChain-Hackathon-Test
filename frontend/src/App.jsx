import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CONTRACT_ADDRESS, CONTRACT_ABI, REGULATOR_ADDRESS } from './contractConfig';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Verify from './components/Verify';
import UMKMRegister from './components/UMKMRegister';
import MySubmissions from './components/MySubmissions';
import RegulatorList from './components/RegulatorList';
import RegulatorDetail from './components/RegulatorDetail';
import Dashboard from './components/Dashboard';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [walletAddress, setWalletAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [isRegulator, setIsRegulator] = useState(false);
  const [provider, setProvider] = useState(null);
  const [umkmContract, setUmkmContract] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const refreshSubmissions = () => {
    try {
      const raw = localStorage.getItem('umkm_submissions') || '[]';
      const arr = JSON.parse(raw);
      setSubmissions(arr);
    } catch (e) {
      setSubmissions([]);
      toast.error("Gagal memuat data pengajuan dari local storage.");
    }
  };

  useEffect(() => {
    refreshSubmissions();
  }, []);
  
  const connectWallet = async () => {
    if (!window.ethereum) return toast.error("MetaMask tidak terdeteksi.");
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(web3Provider);
      setWalletAddress(address);
      setUmkmContract(contract);
      setIsRegulator(address.toLowerCase() === REGULATOR_ADDRESS.toLowerCase());
      
      toast.success("Wallet berhasil terhubung!");
    } catch (error) {
      toast.error("Gagal menghubungkan wallet.");
    }
  };

  const handleLogin = (loginData) => {
    setUser(loginData);
    setCurrentPage(loginData.role === 'regulator' ? 'dashboard' : 'register');
  };

  const handleLogout = () => {
    setUser(null);
    setIsRegulator(false);
    setCurrentPage('home');
  };

  const handleRegister = async ({ hash, ipfsCid, assetType }, callback) => {
    if (!umkmContract) return toast.error("Kontrak belum terinisialisasi.");
    try {
      toast.info("Mengirim transaksi ke blockchain...");
      const tx = await umkmContract.registerAsset(hash, ipfsCid, assetType);
      await tx.wait();
      
      const newSubmission = { hash, ipfsCid, assetType, owner: walletAddress, createdAt: new Date().toISOString() };
      const updatedSubmissions = [...submissions, newSubmission];
      localStorage.setItem('umkm_submissions', JSON.stringify(updatedSubmissions));
      setSubmissions(updatedSubmissions);

      toast.success("Aset berhasil terdaftar di blockchain!");
      if(callback) callback(true);
    } catch (error) {
      const reason = error.reason || "Transaksi ditolak oleh contract.";
      toast.error(`Gagal: ${reason}`);
      if(callback) callback(false);
    }
  };
  
  // [FITUR BARU] Fungsi untuk menghapus pengajuan dari local storage
  const handleDeleteSubmission = (hashToDelete) => {
    if (window.confirm(`Anda yakin ingin menghapus pengajuan ini dari tampilan lokal? Aksi ini tidak akan menghapus data dari blockchain.`)) {
      const updatedSubmissions = submissions.filter(s => s.hash !== hashToDelete);
      localStorage.setItem('umkm_submissions', JSON.stringify(updatedSubmissions));
      setSubmissions(updatedSubmissions);
      toast.success("Pengajuan berhasil dihapus dari tampilan lokal.");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'register':
        return <UMKMRegister onRegister={handleRegister} />;
      case 'mySubmissions':
        const mySubmissions = submissions.filter(s => s.owner && s.owner.toLowerCase() === walletAddress.toLowerCase());
        return <MySubmissions submissions={mySubmissions} umkmContract={umkmContract} />;
      case 'dashboard':
        return <Dashboard submissions={submissions} umkmContract={umkmContract} />;
      case 'regulatorList':
        if (selectedSubmission) {
          return <RegulatorDetail 
            submission={selectedSubmission}
            umkmContract={umkmContract}
            onBack={() => setSelectedSubmission(null)}
            onActionSuccess={refreshSubmissions}
          />
        }
        // [PERUBAHAN] Kirim fungsi onDelete ke RegulatorList
        return <RegulatorList 
                  submissions={submissions} 
                  onOpen={setSelectedSubmission} 
                  umkmContract={umkmContract}
                  onDelete={handleDeleteSubmission}
                />;
      case 'home':
      default:
        return (
          <div className="container" style={{ maxWidth: '960px' }}>
            <div className="row g-5 align-items-center">
              <div className="col-md-6">
                <Verify umkmContract={umkmContract} />
              </div>
              <div className="col-md-6">
                <Login 
                  onLogin={handleLogin} 
                  onConnectWallet={connectWallet} 
                  walletAddress={walletAddress} 
                  isRegulator={isRegulator}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar 
        walletAddress={walletAddress}
        user={user}
        onLogout={handleLogout}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="flex-grow-1 py-4">
        {renderPage()}
      </main>
      <footer className="text-center py-3 bg-white border-top">
        <small>© 2025 UMKMChain | All Rights Reserved</small>
      </footer>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
    </div>
  );
};

export default App;

