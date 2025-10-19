import React, { useState } from 'react';

const Login = ({ onLogin, onConnectWallet, walletAddress }) => {
  const [role, setRole] = useState('umkm');
  const [name, setName] = useState('');
  const [manualAddress, setManualAddress] = useState('');

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      // fallback: ask user to paste address
      alert('MetaMask tidak ditemukan. Anda dapat memasukkan alamat secara manual.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      // call parent login with connected address
      onLogin({ address: addr, role, name: name || 'Anonymous' });
      // let parent also initialize contract if needed
      if (typeof onConnectWallet === 'function') onConnectWallet();
    } catch (e) {
      console.error('Wallet connect failed', e);
      alert('Gagal menghubungkan wallet.');
    }
  };

  const handleManual = (e) => {
    e.preventDefault();
    const addr = manualAddress || '0x0';
    onLogin({ address: addr, role, name: name || 'Anonymous' });
  };

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title mb-3">Masuk / Hubungkan Wallet</h5>
              <p className="text-muted small">Gunakan MetaMask untuk login tanpa kata sandi. Jika tidak punya, masukkan alamat secara manual.</p>

              <div className="d-grid gap-2 mb-3">
                <button className="btn btn-outline-primary btn-lg" onClick={connectMetaMask}>
                  {walletAddress ? 'Connected: ' + (walletAddress.substring(0,6) + '...' + walletAddress.slice(-4)) : 'Connect with MetaMask'}
                </button>
              </div>

              <form onSubmit={handleManual} className="mt-3">
                <div className="mb-2">
                  <label className="form-label small">Nama</label>
                  <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Nama sesuai KTP" />
                </div>

                <div className="mb-2">
                  <label className="form-label small">Role</label>
                  <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="umkm">UMKM</option>
                    <option value="regulator">Regulator</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small">Alamat Wallet (opsional)</label>
                  <input className="form-control" value={manualAddress} onChange={e => setManualAddress(e.target.value)} placeholder="0x..." />
                </div>

                <div className="d-grid">
                  <button className="btn btn-primary">Masuk (manual)</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
