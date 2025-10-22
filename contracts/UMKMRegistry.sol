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
        string ipfsCid; 
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
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    function registerAsset(
        bytes32 _assetHash,
        string memory _assetType,
        string memory _ipfsCid
    ) public {
        require(hashToTokenId[_assetHash] == 0, "Asset with this hash already exists");

        _nextTokenId++;
        uint256 newItemId = _nextTokenId;
        _safeMint(msg.sender, newItemId);

        hashToTokenId[_assetHash] = newItemId;
        tokenData[newItemId] = AssetData({
            owner: msg.sender,
            timestamp: block.timestamp,
            assetType: _assetType,
            isVerified: false,
            reason: "Menunggu Verifikasi",
            ipfsCid: _ipfsCid
        });
    }

    function setVerifiedStatus(uint256 _tokenId, string memory _reason) public {
        require(hasRole(REGULATOR_ROLE, msg.sender), "Caller is not a regulator");
        tokenData[_tokenId].isVerified = true;
        tokenData[_tokenId].reason = _reason;
    }

    // [FITUR BARU] Fungsi untuk mencabut aset
    function revokeAsset(uint256 _tokenId, string memory _reason) public {
        require(hasRole(REGULATOR_ROLE, msg.sender), "Caller is not a regulator");
        tokenData[_tokenId].isVerified = false; // Menandai sebagai tidak terverifikasi/dicabut
        tokenData[_tokenId].reason = _reason; // Menyimpan alasan pencabutan
    }
    
    function getAssetDataByHash(bytes32 _assetHash) public view returns (AssetData memory) {
        uint256 tokenId = hashToTokenId[_assetHash];
        
        if (tokenId == 0) {
            return AssetData(address(0), 0, "", false, "Hash Tidak Terdaftar/Dimodifikasi", ""); 
        }
        
        return tokenData[tokenId];
    }
    
    function getTokenIdByHash(bytes32 _assetHash) public view returns (uint256) {
        return hashToTokenId[_assetHash];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
        AssetData storage data = tokenData[tokenId];
        
        string memory json = string(
            abi.encodePacked(
                '{\"name\": \"', data.assetType, ' Certificate #', tokenId.toString(), '\", ',
                '\"description\": \"Status Legalitas: ', data.reason, '\", ',
                '\"attributes\": [',
                '{\"trait_type\": \"Verified\", \"value\": \"', data.isVerified ? 'SAH' : 'DICABUT/MENUNGGU', '\"},',
                '{\"trait_type\": \"Registered Owner\", \"value\": \"', Strings.toHexString(uint160(data.owner), 20), '\"}',
                '],',
                '\"external_url\": \"https://gateway.pinata.cloud/ipfs/', data.ipfsCid, '\"',
                '}'
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", _toBase64(bytes(json))));
    }

    function _toBase64(bytes memory data) internal pure returns (string memory) {
        bytes memory base64_bytes = new bytes(4 * ((data.length + 2) / 3));
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 j = 0;
        uint256 len = data.length;
        uint256 i = 0;
        while(i < len){
            uint256 val = 0;
            uint8 b1 = uint8(data[i]);
            i++;
            val = uint256(b1) << 16;
            if(i < len){
                uint8 b2 = uint8(data[i]);
                i++;
                val |= (uint256(b2) << 8);
            }
            if(i < len){
                 uint8 b3 = uint8(data[i]);
                 i++;
                 val |= uint256(b3);
            }
            base64_bytes[j] = bytes(table)[(val >> 18) & 0x3F];
            j++;
            base64_bytes[j] = bytes(table)[(val >> 12) & 0x3F];
            j++;
            if (i > len - 2) {
                base64_bytes[j] = bytes(table)[(val >> 6) & 0x3F];
                j++;
            } else {
                base64_bytes[j] = '=';
                j++;
            }
            if (i > len - 1) {
                base64_bytes[j] = bytes(table)[val & 0x3F];
                j++;
            } else {
                 base64_bytes[j] = '=';
                 j++;
            }
        }
        return string(base64_bytes);
    }
}

