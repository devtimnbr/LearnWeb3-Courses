const { ethers } = require("hardhat");

const CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS = "0xf91A0FEA5c76392bf27752B6D88c856aAEB0D50a";

async function main() {
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS);
  await exchange.deployed();

  console.log("Exchange deployed to: ", exchange.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
