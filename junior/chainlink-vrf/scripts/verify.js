const hre = require("hardhat");
const { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } = require("../constants");
require("dotenv").config();

const CONTRACT_ADDRESS = "0xf91A0FEA5c76392bf27752B6D88c856aAEB0D50a";

async function main() {
  console.log("Verify Contract Address: ", CONTRACT_ADDRESS);

  await hre.run("verify:verify", {
    address: CONTRACT_ADDRESS,
    constructorArguments: [VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
