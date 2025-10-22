
// GANTI DENGAN ADDRESS CONTRACT KAMU SETELAH DEPLOY!
export const CONTRACT_ADDRESS = "0xaafd89a4cDB9c7CCAa746Bc205d7C32EDEdf6a3F";

// GANTI DENGAN ADDRESS WALLET REGULATOR KAMU
export const REGULATOR_ADDRESS = "0xB5706507F01C05Bb87Bc7462b2a80816B8691c25";

// ABI Contract
export const CONTRACT_ABI = [
  // Fungsi yang diubah untuk menerima ipfsCid
  "function registerAsset(bytes32 _assetHash, string memory _assetType, string memory _ipfsCid) public",
  
  "function setVerifiedStatus(uint256 _tokenId, string memory _reason) public",
  
  // Struct yang diubah untuk mengembalikan ipfsCid
  "function getAssetDataByHash(bytes32 _assetHash) public view returns (tuple(address owner, uint256 timestamp, string assetType, bool isVerified, string reason, string ipfsCid))",
  
  "function REGULATOR_ROLE() public view returns (bytes32)",
  "function hasRole(bytes32 role, address account) public view returns (bool)",
  "function getTokenIdByHash(bytes32 _assetHash) public view returns (uint256)"
];
