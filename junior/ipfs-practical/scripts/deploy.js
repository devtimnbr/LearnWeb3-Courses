const { ethers } = require("hardhat");

async function main() {
  const metadataURL = "ipfs://Qmbygo38DWF1V8GttM1zy89KzyZTPU2FLUzQtiDvB7q6i5";
  const lw3PunksContract = await ethers.getContractFactory("LW3Punks");
  const deployedLw3PunksContract = await lw3PunksContract.deploy(metadataURL);
  await deployedLw3PunksContract.deployed();

  console.log("lw3Punks deployed to:", deployedLw3PunksContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
