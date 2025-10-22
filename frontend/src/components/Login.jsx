import React, { useState } from 'react';

const Login = ({ onLogin, onConnectWallet, walletAddress, isRegulator }) => {
  const [name, setName] = useState('');

  const handleLoginAttempt = (selectedRole) => {
    onLogin({
      role: selectedRole,
      name: name || (selectedRole === 'umkm' ? 'Pelaku UMKM' : 'Regulator'),
    });
  };

  return (
    <div className="card border-0 bg-transparent">
      <div className="card-body p-0">
        <h4 className="card-title fw-bold text-center">Masuk / Login</h4>
        <p className="card-text text-center text-muted small mb-4">
          Hubungkan wallet Anda, lalu pilih peran untuk melanjutkan.
        </p>

        {/* Wrapper untuk menjaga tinggi layout tetap statis */}
        <div style={{ minHeight: '230px' }}>
          {/* Langkah 1: Tombol Hubungkan Wallet */}
          {!walletAddress && (
            <div className="d-grid mb-3 pt-4">
               <button onClick={onConnectWallet} className="btn btn-warning fw-bold">
                Hubungkan Wallet MetaMask
              </button>
            </div>
          )}

          {/* Langkah 2: Tombol Login (ditampilkan setelah wallet terhubung) */}
          {walletAddress && (
              <>
                <div className="alert alert-success small text-center">
                  Wallet Terhubung: <br/><strong>{walletAddress}</strong>
                </div>
                <div className="mb-3">
                    <label htmlFor="nameInput" className="form-label small">Nama Anda (Opsional)</label>
                    <input
                        type="text"
                        id="nameInput"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Budi Hartono"
                    />
                </div>

                {/* Logika untuk menampilkan tombol yang relevan */}
                <div className="d-grid gap-2">
                  {isRegulator ? (
                    // Jika wallet adalah regulator, hanya tampilkan tombol login regulator
                    <button onClick={() => handleLoginAttempt('regulator')} className="btn btn-secondary">
                      Masuk sebagai Regulator
                    </button>
                  ) : (
                    // Jika bukan, hanya tampilkan tombol login UMKM
                    <button onClick={() => handleLoginAttempt('umkm')} className="btn btn-primary">
                      Masuk sebagai UMKM
                    </button>
                  )}
                </div>
              </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

