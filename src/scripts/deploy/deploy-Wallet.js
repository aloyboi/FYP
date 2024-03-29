// imports
const { ethers, run, network } = require("hardhat");
const {
    networkConfig,
    developmentChain,
} = require("../../helper-hardhat-config");

// async main
async function main() {
    const wallet = await ethers.getContractFactory("Wallet");
    console.log("Deploying Wallet contract...");

    const Wallet = await wallet.deploy();
    await Wallet.deployed();
    console.log(`Deployed contract to: ${Wallet.address}`);
    // what happens when we deploy to our hardhat network?
    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");
        await Wallet.deployTransaction.wait(6);
        await verify(Wallet.address, []);
    }
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!");
        } else {
            console.log(e);
        }
    }
};

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
