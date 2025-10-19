import React, { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const AssetGallery = ({ CONTRACT_ADDRESS }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Demo data
  const demoAssets = [
    {
      tokenId: '1',
      hash: '0xabc123def4567890abc1',
      name: 'IUMK Certificate #1',
      status: 'SAH',
      owner: '0xb5706507f01c05bb87bc7462b2a80816b8691c25',
      assetType: 'IUMK',
      timestamp: '2025-01-19 10:30:00'
    },
    {
      tokenId: '2',
      hash: '0xdef789abc1234567def2',
      name: 'Halal Certificate #2',
      status: 'MENUNGGU',
      owner: '0xa1234567890123456789012345678901234567890',
      assetType: 'Halal',
      timestamp: '2025-01-19 11:15:00'
    },
    {
      tokenId: '3',
      hash: '0x987fedcba6543210987',
      name: 'NIB Certificate #3',
      status: 'SAH',
      owner: '0xc9876543210987654321098765432109876543210',
      assetType: 'NIB',
      timestamp: '2025-01-19 12:00:00'
    }
  ];

  const [assets] = useState(demoAssets);

  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       asset.tokenId.includes(searchTerm);
    const matchFilter = filterStatus === 'all' || 
                       (filterStatus === 'verified' && asset.status === 'SAH') ||
                       (filterStatus === 'pending' && asset.status === 'MENUNGGU');
    return matchSearch && matchFilter;
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">🖼️ Asset Gallery</h2>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by name or token ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="verified">✅ Verified Only</option>
            <option value="pending">⏳ Pending Only</option>
          </select>
        </div>
        <div className="col-md-3">
          <div className="badge bg-secondary p-2 w-100">
            Total: {filteredAssets.length} assets
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>📭 No assets found</h5>
          <p className="mb-0">Try different filters</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredAssets.map((asset) => (
            <div key={asset.tokenId} className="col-md-4 col-lg-3">
              <div className="card h-100 shadow border-0" style={{
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-header bg-primary text-white text-center">
                  <strong>{asset.hash ? `Code: ${asset.hash.substring(0,10)}...` : `Token #${asset.tokenId}`}</strong>
                </div>
                
                <div className="card-body text-center">
                  {/* QR Code */}
                  <div className="mb-3">
                    <QRCode 
                      value={JSON.stringify({
                        tokenId: asset.tokenId,
                        hash: asset.hash || null,
                        contract: CONTRACT_ADDRESS,
                        assetType: asset.assetType
                      })}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <h6 className="card-title fw-bold text-truncate" title={asset.name}>
                    {asset.name}
                  </h6>
                  
                  <div className="mb-2">
                    <span className={`badge ${
                      asset.status === 'SAH' ? 'bg-success' : 'bg-warning text-dark'
                    }`}>
                      {asset.status}
                    </span>
                  </div>

                  <p className="small text-muted mb-2">
                    Type: {asset.assetType}
                  </p>
                  
                  <p className="small text-muted mb-2">
                    Owner: {asset.owner.substring(0, 8)}...
                  </p>
                  
                  <p className="small text-muted">
                    {asset.timestamp}
                  </p>
                </div>

                <div className="card-footer bg-white border-0">
                  <button 
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() => alert(`Details for Token #${asset.tokenId}`)}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetGallery;