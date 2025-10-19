import React from 'react';

const Navbar = ({ walletAddress, onConnect, currentPage, setCurrentPage, isRegulator, user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom mb-4">
      <div className="container">
        <a className="navbar-brand fw-semibold text-dark" href="#" onClick={() => setCurrentPage('home')}>
          UMKMChain
        </a>

        <div className="d-flex align-items-center ms-auto gap-3">
          <div>
            <button className={`btn btn-sm btn-link text-muted ${currentPage === 'home' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('home')}>Home</button>
            {user && user.role === 'umkm' && (
              <>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'register' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('register')}>Daftar</button>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'mySubmissions' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('mySubmissions')}>Pengajuan</button>
              </>
            )}
            {user && user.role === 'regulator' && (
              <>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'regulatorList' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('regulatorList')}>Semua Pengajuan</button>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'adminPurge' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('adminPurge')}>Admin Purge</button>
              </>
            )}
          </div>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <div className="me-2 text-muted small">{user.name} • {user.role.toUpperCase()}</div>
                <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>Logout</button>
              </>
            ) : (
              (walletAddress) ? (
                <div className="d-flex align-items-center small text-muted">
                  <span className="me-2">{walletAddress.substring(0,6)}...{walletAddress.slice(-4)}</span>
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={onConnect}>Connect Wallet</button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;