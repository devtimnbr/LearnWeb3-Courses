const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const CryptoDevToken = await hre.ethers.getContractFactory("CryptoDevToken");
  const cryptoDevToken = await CryptoDevToken.deploy("0x3b4523B2B03C3a070E69462E8ddc4B5A70B8c918");

  await cryptoDevToken.deployed();

  console.log("CryptoDevToken deployed to:", cryptoDevToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
