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

    const chainId = network.config.chainId;
    const usdcAddress = networkConfig[chainId]["USDC"];

    const Wallet = await wallet.deploy(
        "0x6D4886675d7C8F98CDA65440A14C9fe7F84A0C85" //Exchange Address
    );
    await Wallet.deployed();
    console.log(`Deployed contract to: ${Wallet.address}`);
    // what happens when we deploy to our hardhat network?
    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");
        await Wallet.deployTransaction.wait(6);
        await verify(Wallet.address, [
            "0x6D4886675d7C8F98CDA65440A14C9fe7F84A0C85",
        ]);
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
