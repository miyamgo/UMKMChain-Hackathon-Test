import React from 'react';

const Navbar = ({ walletAddress, user, onLogout, currentPage, setCurrentPage }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container">
        <a className="navbar-brand fw-bold text-dark" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
          UMKMChain
        </a>

        <div className="d-flex align-items-center ms-auto gap-3">
          <div>
            <button className={`btn btn-sm btn-link text-muted ${currentPage === 'home' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('home')}>Home</button>
            {user && user.role === 'umkm' && (
              <>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'register' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('register')}>Daftar</button>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'mySubmissions' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('mySubmissions')}>Pengajuan Saya</button>
              </>
            )}
            {user && user.role === 'regulator' && (
              <>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'dashboard' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
                <button className={`btn btn-sm btn-link text-muted ${currentPage === 'regulatorList' ? 'fw-bold text-dark' : ''}`} onClick={() => setCurrentPage('regulatorList')}>Daftar Pengajuan</button>
                {/* [PERUBAHAN] Hapus tombol Admin Purge */}
              </>
            )}
          </div>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <div className="me-2 text-muted small">{user.name} ({user.role.toUpperCase()})</div>
                <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>Logout</button>
              </>
            ) : (
              (walletAddress) ? (
                <div className="d-flex align-items-center small text-muted">
                  <span className="me-2">{walletAddress.substring(0,6)}...{walletAddress.slice(-4)}</span>
                </div>
              ) : (
                // Tombol connect wallet tidak lagi di sini karena alur login sudah lebih baik
                <></>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

