const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20", function () {
  it("Should create an erc20 token with constructor values", async function () {
    const name = "LW3Token";
    const symbol = "LW3";
    const supply = 1000;
    const ERC20 = await hre.ethers.getContractFactory("LW3Token");
    const erc20 = await ERC20.deploy(name, symbol, supply);
    await erc20.deployed();

    expect(await erc20.name()).to.equal(name);
    expect(await erc20.symbol()).to.equal(symbol);
    // check if supply is equal provided supply
    expect(await erc20.totalSupply()).to.equal(
      ethers.utils.parseUnits(supply.toString(), await erc20.decimals())
    );
  });
});
