require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.6",
  networks: {
    rinkeby: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
