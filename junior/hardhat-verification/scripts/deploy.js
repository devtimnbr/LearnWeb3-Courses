const hre = require("hardhat");
const { ethers } = require("hardhat");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

async function main() {
  const VerifyContract = await ethers.getContractFactory("Verify");
  const verifyContract = await VerifyContract.deploy();
  await verifyContract.deployed();

  console.log("Verify Contract Address: ", verifyContract.address);

  console.log("Sleeping...");
  // wait for etherscan to notice that the contract has been deployed
  await sleep(60000);

  // verify the contract
  await hre.run("verify:verify", {
    address: verifyContract.address,
    constructorArguments: [],
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
