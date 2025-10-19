import React, { useState } from 'react';

const QRScanner = ({ CONTRACT_ADDRESS }) => {
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleManualVerify = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(manualInput);
      
      // Simulate verification (replace with actual blockchain call)
      setTimeout(() => {
        setScanResult({
          success: true,
          tokenId: data.tokenId,
          contract: data.contract,
          assetType: data.assetType || 'IUMK',
          status: 'SAH',
          owner: '0xb5706507f01c05bb87bc7462b2a80816b8691c25',
          timestamp: new Date().toLocaleString('id-ID')
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      alert('Invalid QR data format. Please check your input.');
      setLoading(false);
    }
  };

  const useSampleData = () => {
    const sample = JSON.stringify({
      tokenId: "1",
      contract: CONTRACT_ADDRESS,
      assetType: "IUMK"
    }, null, 2);
    setManualInput(sample);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">📷 QR Code Scanner & Verifier</h4>
            </div>
            
            <div className="card-body p-4">
              <div className="alert alert-info">
                <strong>ℹ️ How to use:</strong>
                <ul className="mb-0 mt-2">
                  <li>Copy QR data from Asset Gallery</li>
                  <li>Paste in the text area below</li>
                  <li>Click "Verify Asset" to check authenticity</li>
                </ul>
              </div>

              {/* Manual Input */}
              <div className="mb-4">
                <label className="form-label fw-bold">✍️ Paste QR Data (JSON)</label>
                <textarea 
                  className="form-control font-monospace" 
                  rows="6"
                  placeholder='{"tokenId":"1","contract":"0x...","assetType":"IUMK"}'
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                ></textarea>
                <small className="text-muted">
                  Get QR data from Asset Gallery
                </small>
              </div>

              <div className="d-grid gap-2 mb-3">
                <button 
                  className="btn btn-primary btn-lg fw-bold"
                  onClick={handleManualVerify}
                  disabled={loading || !manualInput}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Verifying...
                    </>
                  ) : (
                    '🔍 Verify Asset'
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={useSampleData}
                >
                  📋 Use Sample Data
                </button>
              </div>

              {/* Result */}
              {scanResult && (
                <div className={`mt-4 p-4 border rounded-3 ${
                  scanResult.success ? 'border-success bg-light' : 'border-danger bg-light'
                }`}>
                  <h5 className="fw-bold mb-3">
                    {scanResult.success ? '✅ Verification Result' : '❌ Verification Failed'}
                  </h5>

                  {scanResult.success && (
                    <>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="small fw-bold text-muted">Token ID</label>
                          <p className="mb-0 fw-bold">#{scanResult.tokenId}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="small fw-bold text-muted">Status</label>
                          <p className="mb-0">
                            <span className="badge bg-success fs-6">
                              {scanResult.status}
                            </span>
                          </p>
                        </div>
                        <div className="col-12">
                          <label className="small fw-bold text-muted">Asset Type</label>
                          <p className="mb-0">{scanResult.assetType}</p>
                        </div>
                        <div className="col-12">
                          <label className="small fw-bold text-muted">Owner Address</label>
                          <p className="mb-0 font-monospace small text-break">
                            {scanResult.owner}
                          </p>
                        </div>
                        <div className="col-12">
                          <label className="small fw-bold text-muted">Verified On</label>
                          <p className="mb-0">{scanResult.timestamp}</p>
                        </div>
                      </div>

                      <div className="alert alert-success mt-3 mb-0">
                        <strong>✓ Authentic Asset</strong><br/>
                        This asset is registered on the blockchain.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;