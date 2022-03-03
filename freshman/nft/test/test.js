const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", () => {
  it("Should create NFT with name and symbol", async () => {
    const name = "NFT Card";
    const symbol = "NFT";

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(name, symbol);
    await nft.deployed();

    expect(await nft.name()).to.equal(name);
    expect(await nft.symbol()).to.equal(symbol);
  });
});
