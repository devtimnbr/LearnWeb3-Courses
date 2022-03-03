const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Whitelist", function () {
  it("Should deploy and set maxWhitelistedAddresses", async function () {
    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(10);
    await whitelist.deployed();
    expect(await whitelist.maxWhitelistedAddresses()).to.equal(10);
  });

  it("Should add sender to whitelist hashmap", async () => {
    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(10);
    await whitelist.deployed();

    const preNumAddressesWhitelisted =
      await whitelist.numAddressesWhitelisted();
    // add address to whitelist
    await whitelist.addAddressToWhitelist();
    expect(await whitelist.numAddressesWhitelisted()).to.equal(
      preNumAddressesWhitelisted + 1
    );
  });

  it("Should revert if address is already on wl", async () => {
    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(10);
    await whitelist.deployed();

    // add address to whitelist
    await whitelist.addAddressToWhitelist();
    await expect(whitelist.addAddressToWhitelist()).to.be.revertedWith(
      "Sender has already been whitelisted"
    );
  });

  it("Should revert if wl limit is reached", async () => {
    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(1);
    await whitelist.deployed();

    const signers = await ethers.getSigners();
    const whitelist1 = whitelist.connect(signers[0]);
    const whitelist2 = whitelist.connect(signers[1]);

    await whitelist1.addAddressToWhitelist();
    await expect(whitelist2.addAddressToWhitelist()).to.be.revertedWith(
      "More addresses cant be added, limit reached"
    );
  });
});
