const hre = require("hardhat");
const { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } = require("../constants");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const randomWinnerGame = await hre.ethers.getContractFactory("RandomWinnerGame");
  const deployedRandomWinnerGame = await randomWinnerGame.deploy(VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE);
  await deployedRandomWinnerGame.deployed();

  console.log("Verify Contract Address: ", deployedRandomWinnerGame.address);
  console.log("Sleeping....");
  await sleep(60000);

  await hre.run("verify:verify", {
    address: deployedRandomWinnerGame.address,
    constructorArguments: [VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
