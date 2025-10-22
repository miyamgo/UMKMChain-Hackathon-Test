const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UMKMRegistry Contract", function () {
  let umkmRegistry;
  let owner, regulator, umkm1, umkm2;
  
  // Deploy kontrak baru sebelum setiap tes
  beforeEach(async function () {
    [owner, regulator, umkm1, umkm2] = await ethers.getSigners();
    
    const UMKMRegistry = await ethers.getContractFactory("UMKMRegistry");
    umkmRegistry = await UMKMRegistry.deploy(regulator.address);
  });

  describe("Deployment", function () {
    it("Harus set nama NFT dengan benar", async function () {
      expect(await umkmRegistry.name()).to.equal("UMKM Certificate");
    });

    it("Harus set symbol NFT dengan benar", async function () {
      expect(await umkmRegistry.symbol()).to.equal("UMKM");
    });

    it("Harus memberikan REGULATOR_ROLE ke alamat regulator", async function () {
      const REGULATOR_ROLE = await umkmRegistry.REGULATOR_ROLE();
      expect(await umkmRegistry.hasRole(REGULATOR_ROLE, regulator.address)).to.be.true;
    });
  });

  describe("Pendaftaran Aset", function () {
    it("UMKM bisa mendaftarkan aset", async function () {
      const assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB123456"));
      const ipfsCid = "Qm...testCid"; // Contoh CID
      
      // [PERBAIKAN] Memanggil registerAsset dengan 3 argumen
      await expect(umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB", ipfsCid))
        .to.emit(umkmRegistry, 'Transfer') // Memastikan NFT di-mint
        .withArgs(ethers.ZeroAddress, umkm1.address, 1); // TokenId 1

      const assetData = await umkmRegistry.getAssetDataByHash(assetHash);
      expect(assetData.owner).to.equal(umkm1.address);
      expect(assetData.ipfsCid).to.equal(ipfsCid);
    });

    it("Tidak bisa mendaftar hash yang sama dua kali", async function () {
      const assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB123456"));
      const ipfsCid = "Qm...testCid";

      // Pendaftaran pertama
      await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB", ipfsCid);
      
      // Pendaftaran kedua (harus gagal)
      await expect(
        umkmRegistry.connect(umkm2).registerAsset(assetHash, "NIB", ipfsCid)
      ).to.be.revertedWith("Asset with this hash already exists");
    });
  });

  describe("Verifikasi oleh Regulator", function () {
    let assetHash;
    let tokenId;

    beforeEach(async function() {
        assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB_FOR_VERIFY"));
        await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB", "QmVerify");
        tokenId = await umkmRegistry.getTokenIdByHash(assetHash);
    });

    it("Regulator bisa memverifikasi aset menjadi SAH", async function () {
      await umkmRegistry.connect(regulator).setVerifiedStatus(tokenId, "SAH - Terverifikasi");
      
      const assetData = await umkmRegistry.getAssetDataByHash(assetHash);
      expect(assetData.isVerified).to.be.true;
      expect(assetData.reason).to.equal("SAH - Terverifikasi");
    });

    it("Non-regulator tidak bisa memverifikasi aset", async function () {
      await expect(
        umkmRegistry.connect(umkm2).setVerifiedStatus(tokenId, "SAH")
      ).to.be.reverted; // Reverted karena tidak punya role
    });
  });

  describe("Pencabutan oleh Regulator", function () {
    let assetHash;
    let tokenId;

    beforeEach(async function() {
        assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB_FOR_REVOKE"));
        await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB", "QmRevoke");
        tokenId = await umkmRegistry.getTokenIdByHash(assetHash);
        // Setujui dulu sebelum bisa dicabut
        await umkmRegistry.connect(regulator).setVerifiedStatus(tokenId, "SAH");
    });

    it("Regulator bisa mencabut aset", async function () {
      await umkmRegistry.connect(regulator).revokeAsset(tokenId, "Dicabut - Pelanggaran");
      
      const assetData = await umkmRegistry.getAssetDataByHash(assetHash);
      expect(assetData.isVerified).to.be.false;
      expect(assetData.reason).to.equal("Dicabut - Pelanggaran");
    });
  });
});
