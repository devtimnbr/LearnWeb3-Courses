const { ethers } = require("hardhat");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

async function main() {
  // verify the contract
  await hre.run("verify:verify", {
    address: "0x2Df0e3c007ed6E3EF0815eB621415237A4143FE3",
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
