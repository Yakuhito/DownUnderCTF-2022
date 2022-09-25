/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const { getJsonWalletAddress } = require("ethers/lib/utils");

require("hardhat-watcher");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      forking: {
        url: "https://blockchain-evmvault-c666d5bb89a01c70-eth.2022.ductf.dev/",
        blockNumber: 2,
        chainId: 31337
      },
      accounts: [
        {
          privateKey: "0xc30ff3001e44d2606b5d00a654fcc3acf193f7a12c9da25e51f2bcf6bd010fc2",
          balance: "10000000000000000000"
        }
      ],
    },
    evmvaultmechanism: {
      url: "https://blockchain-evmvault-c666d5bb89a01c70-eth.2022.ductf.dev/",
      accounts: [
        "0xc30ff3001e44d2606b5d00a654fcc3acf193f7a12c9da25e51f2bcf6bd010fc2",
      ],
      chainId: 31337
    },
    casino: {
      url: "https://blockchain-cryptocasino-48e75038bd446b9c-eth.2022.ductf.dev/",
      accounts: [
        "0x3ef4b792fbc6dfad6f99c11513b4f2d57f746652094db81e897a95458b4a961d",
      ],
      chainId: 31337
    },
    privatelog: {
      url: "https://blockchain-privatelog-d0166b32e6dee569-eth.2022.ductf.dev/",
      accounts: [
        "0xc9457113cb60f4279049e38c5a125698a0bfa4f636c95b878d09a2542e356c5f",
        "0xc9457113cb60f4279049e38c5a125698a0bfa4f636c95b878d09a2542e356c60" // incremented by 1 so we have a deployer
      ],
      chainId: 31337
    },
    sae: {
      url: "https://blockchain-secretandephemeral-e324d78349e11b3e-eth.2022.ductf.dev/",
      accounts: [
        "0x70586b945991b12c481cc395695ada9a5b322f8b3812ce42a7a4f817fc100204"
      ],
      chainId: 31337
    },
    solveme: {
      url: "https://blockchain-solveme-be83d66f8885c872-eth.2022.ductf.dev/",
      accounts: [
        "0x67f027b260ee4f5b04e63ff5bc175349b480f497da0f79b47f854c7a912d0ce1"
      ],
      chainId: 31337
    },
  },
  watcher: {
    compile: {
      tasks: ["compile"],
    },
    test: {
      tasks: ["test"],
      files: ["contracts", "test"],
    },
  },
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_APIKEY,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY,
  },
};
