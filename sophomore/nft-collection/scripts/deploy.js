const { ethers } = require("hardhat");

async function main() {
  // We get the contract to deploy
  const CryptoDevs = await ethers.getContractFactory("CryptoDevs");
  const cryptoDevs = await CryptoDevs.deploy(
    "Crypto Devs",
    "CD",
    "https://learn-web3-tasks.vercel.app/api/",
    "0xFE98db5f28a6b14b16da8Af5C56a6aa6FcC0f48F"
  );
  await cryptoDevs.deployed();
  console.log("Crypto Devs deployed to: " + cryptoDevs.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
