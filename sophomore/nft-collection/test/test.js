const { expect } = require("chai");
const { ethers } = require("hardhat");

const name = "Crypto Devs";
const symbol = "CD";

const deployContract = async () => {
  const CryptoDevs = await ethers.getContractFactory("CryptoDevs");
  const cryptoDevs = await CryptoDevs.deploy(
    name,
    symbol,
    "ipfs://",
    "0xFE98db5f28a6b14b16da8Af5C56a6aa6FcC0f48F"
  );
  await cryptoDevs.deployed();
  return cryptoDevs;
};

describe("CryptoDevs", function () {
  it("Should create collection with name and symbol and 20 max supply", async function () {
    const cryptoDevs = await deployContract();
    expect(await cryptoDevs.name()).to.be.eq(name);
    expect(await cryptoDevs.symbol()).to.be.eq(symbol);
    expect(await cryptoDevs.maxTokenIds()).to.be.eq(20);
  });

  it("Should pause contract", async () => {
    const cryptoDevs = await deployContract();
    expect(await cryptoDevs._paused()).to.be.eq(false);
    await cryptoDevs.setPaused(true);
    expect(await cryptoDevs._paused()).to.be.eq(true);
  });

  it("Should start presale when owner", async () => {
    const cryptoDevs = await deployContract();
    expect(await cryptoDevs.presaleStarted()).to.be.eq(false);
    await cryptoDevs.startPresale();
    expect(await cryptoDevs.presaleStarted()).to.be.eq(true);
    // test onlyOwner
    const signers = ethers.getSigners();
    const cryptoDevsNotOwner = cryptoDevs.connect(signers[1]);
    await expect(cryptoDevsNotOwner.startPresale()).to.reverted;
  });
});
