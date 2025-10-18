// frontend/src/components/LoginPage.jsx

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { REGULATOR_ADDRESS, SEPOLIA_CHAIN_ID } from '../contractConfig';

const LoginPage = ({ onLoginSuccess }) => {
    const [statusMessage, setStatusMessage] = useState({ type: 'info', text: 'Klik untuk memulai otentikasi.' });
    
    const handleLogin = async () => {
        if (!window.ethereum) {
            setStatusMessage({ type: 'danger', text: "❌ MetaMask tidak terdeteksi. Harap instal." });
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // 1. Memaksa Beralih Jaringan ke Sepolia
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }], 
            });
            
            // 2. Meminta Akses Akun
            const accounts = await provider.send("eth_requestAccounts", []);
            const walletAddress = accounts[0];
            
            // 3. Logika Penentuan Peran
            const isRegulator = walletAddress.toLowerCase() === REGULATOR_ADDRESS.toLowerCase();
            const userRole = isRegulator ? 'Regulator' : 'UMKM';

            // 4. Proses Tanda Tangan (Simulasi SIWE/Login)
            const message = `Login ke UMKMChain sebagai ${userRole}. Nonce: ${Date.now()}`;
            const signer = await provider.getSigner();
            await signer.signMessage(message); 
            
            setStatusMessage({ type: 'success', text: `✅ Login Sukses sebagai ${userRole}!` });
            
            // Panggil callback untuk pindah ke halaman lobby
            onLoginSuccess(walletAddress, isRegulator);

        } catch (error) {
            setStatusMessage({ type: 'danger', text: "❌ Login dibatalkan atau gagal." });
            console.error("Login Error:", error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px' }}>
                <div className="card-body text-center">
                    <h2 className="card-title fw-bold">🏛️ UMKMChain Login</h2>
                    <p className="card-text text-muted">Gunakan Wallet Anda sebagai Identitas Digital.</p>
                    
                    <button 
                        className="btn btn-primary btn-lg w-100 my-4" 
                        onClick={handleLogin}
                    >
                        🦊 Sign In with MetaMask
                    </button>
                    
                    <div className={`alert alert-${statusMessage.type} mt-3`} role="alert">
                        {statusMessage.text}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;