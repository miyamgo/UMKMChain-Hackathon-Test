const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UMKMRegistry Contract", function () {
  let umkmRegistry;
  let owner, regulator, umkm1, umkm2;
  
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
      
      await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB");
      
      const assetData = await umkmRegistry.getAssetDataByHash(assetHash);
      expect(assetData.owner).to.equal(umkm1.address);
      expect(assetData.assetType).to.equal("NIB");
      expect(assetData.isVerified).to.be.false;
    });

    it("Tidak bisa mendaftar hash yang sama dua kali", async function () {
      const assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB123456"));
      
      await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB");
      
      await expect(
        umkmRegistry.connect(umkm2).registerAsset(assetHash, "NIB")
      ).to.be.revertedWith("Asset already registered.");
    });
  });

  describe("Verifikasi oleh Regulator", function () {
    it("Regulator bisa memverifikasi aset menjadi SAH", async function () {
      const assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB123456"));
      await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB");
      
      await umkmRegistry.connect(regulator).setVerifiedStatus(1, "SAH - Terverifikasi");
      
      const assetData = await umkmRegistry.getAssetDataByHash(assetHash);
      expect(assetData.isVerified).to.be.true;
      expect(assetData.reason).to.equal("SAH - Terverifikasi");
    });

    it("Non-regulator tidak bisa memverifikasi aset", async function () {
      const assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB123456"));
      await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB");
      
      await expect(
        umkmRegistry.connect(umkm2).setVerifiedStatus(1, "SAH")
      ).to.be.reverted;
    });
  });

  describe("Pencabutan oleh Regulator", function () {
    it("Regulator bisa mencabut aset", async function () {
      const assetHash = ethers.keccak256(ethers.toUtf8Bytes("NIB123456"));
      await umkmRegistry.connect(umkm1).registerAsset(assetHash, "NIB");
      await umkmRegistry.connect(regulator).setVerifiedStatus(1, "SAH");
      
      await umkmRegistry.connect(regulator).revokeAsset(1, "Masa Berlaku Habis");
      
      const assetData = await umkmRegistry.getAssetDataByHash(assetHash);
      expect(assetData.isVerified).to.be.false;
      expect(assetData.reason).to.equal("Masa Berlaku Habis");
    });
  });
});