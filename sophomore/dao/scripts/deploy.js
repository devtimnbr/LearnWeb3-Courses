const { ethers } = require("hardhat");

const CYPTODEVS_NFT_CONTRACT_ADDRESS = "0x3b4523B2B03C3a070E69462E8ddc4B5A70B8c918";

async function main() {
  const FakeNftMarketplace = await ethers.getContractFactory("FakeNFTMarketplace");
  const fakeNftMarketplace = await FakeNftMarketplace.deploy();
  await fakeNftMarketplace.deployed();

  console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);

  const CryptoDevsDAO = await ethers.getContractFactory("CryptoDevsDao");
  const cryptoDevsDAO = await CryptoDevsDAO.deploy(fakeNftMarketplace.address, CYPTODEVS_NFT_CONTRACT_ADDRESS, {
    value: ethers.utils.parseEther("0.1"),
  });
  await cryptoDevsDAO.deployed();

  console.log("CryptoDevsDAO deployed to: ", cryptoDevsDAO.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
