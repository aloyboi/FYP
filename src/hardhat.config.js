require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("hardhat-contract-sizer");
//require("solidity-coverage");
require("hardhat-deploy");
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

//const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: GOERLI_RPC_URL,
                accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
                chainId: 5,
                blockConfirmations: 6,
                gas: 2100000000,
                gasPrice: 30000000000,
                blockNumber: 8704643,
            },
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
            chainId: 5,
            blockConfirmations: 6,
            gas: 2100000000,
            gasPrice: 30000000000,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.0",
            },
            {
                version: "0.8.7",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.4.19",
            },
        ],
        settings: { optimizer: { enabled: true, runs: 200 } },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    mocha: {
        timeout: 500000,
    },
};
