const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther, formatUnits, parseUnits } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("CryptoDevToken", function () {
  let cryptoDevToken;

  beforeEach(async () => {
    const CryptoDevToken = await ethers.getContractFactory("CryptoDevToken");
    cryptoDevToken = await CryptoDevToken.deploy(
      "0x3b4523B2B03C3a070E69462E8ddc4B5A70B8c918"
    );
    await cryptoDevToken.deployed();
  });

  it("Should create token", async function () {
    expect(await cryptoDevToken.name()).to.be.eq("Crypto Dev Token");
    expect(await cryptoDevToken.symbol()).to.be.eq("CD");
    expect(await cryptoDevToken.totalSupply()).to.be.eq(BigNumber.from(0));
  });

  it("Should mint tokens", async () => {
    const signer = await ethers.getSigner();
    const cryptoDevTokenWithSigner = cryptoDevToken.connect(signer);
    const tx = await cryptoDevTokenWithSigner.mint(10, {
      value: parseEther("1"),
    });
    await tx.wait();
    expect(await cryptoDevToken.totalSupply()).to.be.eq(parseUnits("10", 18));
  });

  it("Should revert mint tokens if not enough ether is ent", async () => {
    const signer = await ethers.getSigner();
    const cryptoDevTokenWithSigner = cryptoDevToken.connect(signer);
    await expect(
      cryptoDevTokenWithSigner.mint(10, {
        value: parseEther("0.001"),
      })
    ).to.be.revertedWith("'Ether sent is incorrect'");
  });
});
