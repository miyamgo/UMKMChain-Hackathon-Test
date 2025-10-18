// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UMKMRegistry is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");
    
    struct AssetData {
        address owner;
        uint256 timestamp;
        string assetType;
        bool isVerified;
        string reason;
    }

    mapping(bytes32 => uint256) private hashToTokenId;
    mapping(uint256 => AssetData) private tokenData;
    uint256 private _nextTokenId;
    
    constructor(address initialRegulator) 
        ERC721("UMKM Certificate", "UMKM")
    {
        _grantRole(REGULATOR_ROLE, initialRegulator);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    // Override supportsInterface untuk fix konflik
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    function registerAsset(bytes32 _assetHash, string memory _assetType) public {
        require(_assetHash != bytes32(0), "Hash cannot be zero.");
        require(hashToTokenId[_assetHash] == 0, "Asset already registered.");

        _nextTokenId++;
        uint256 currentTokenId = _nextTokenId;

        tokenData[currentTokenId] = AssetData({
            owner: msg.sender,
            timestamp: block.timestamp,
            assetType: _assetType,
            isVerified: false,
            reason: "Menunggu Verifikasi Regulator"
        });

        hashToTokenId[_assetHash] = currentTokenId;
        _safeMint(msg.sender, currentTokenId);
    }

    function setVerifiedStatus(uint256 _tokenId, string memory _reason) public onlyRole(REGULATOR_ROLE) {
        ownerOf(_tokenId); 
        
        tokenData[_tokenId].isVerified = true;
        tokenData[_tokenId].reason = _reason;
    }

    function revokeAsset(uint256 _tokenId, string memory _reason) public onlyRole(REGULATOR_ROLE) {
        ownerOf(_tokenId); 
        
        tokenData[_tokenId].isVerified = false;
        tokenData[_tokenId].reason = _reason;
    }
    
    function getAssetDataByHash(bytes32 _assetHash) public view returns (AssetData memory) {
        uint256 tokenId = hashToTokenId[_assetHash];
        
        if (tokenId == 0) {
            return AssetData(address(0), 0, "", false, "Hash Tidak Terdaftar/Dimodifikasi"); 
        }
        
        return tokenData[tokenId];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
        AssetData storage data = tokenData[tokenId];
        
        string memory json = string(
            abi.encodePacked(
                '{"name": "', data.assetType, ' Certificate #', tokenId.toString(), '", ',
                '"description": "Status Legalitas: ', data.reason, '", ',
                '"attributes": [',
                '{"trait_type": "Verified", "value": "', data.isVerified ? 'SAH' : 'DICABUT/MENUNGGU', '"},',
                '{"trait_type": "Registered Owner", "value": "', Strings.toHexString(uint160(data.owner), 20), '"}',
                ']}'
            )
        );
        
        return string(abi.encodePacked("data:application/json;utf8,", json));
    }
}