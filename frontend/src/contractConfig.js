
// GANTI DENGAN ADDRESS CONTRACT KAMU SETELAH DEPLOY!
export const CONTRACT_ADDRESS = "0xe77db7141193a0652DB7fD4022e905E8c2254030";

// GANTI DENGAN ADDRESS WALLET REGULATOR KAMU
export const REGULATOR_ADDRESS = "0xB5706507F01C05Bb87Bc7462b2a80816B8691c25";

// ABI Contract
export const CONTRACT_ABI = [
  "function registerAsset(bytes32 _assetHash, string memory _assetType) public",
  "function setVerifiedStatus(uint256 _tokenId, string memory _reason) public",
  "function revokeAsset(uint256 _tokenId, string memory _reason) public",
  "function getAssetDataByHash(bytes32 _assetHash) public view returns (tuple(address owner, uint256 timestamp, string assetType, bool isVerified, string reason))",
  "function REGULATOR_ROLE() public view returns (bytes32)",
  "function hasRole(bytes32 role, address account) public view returns (bool)"
];