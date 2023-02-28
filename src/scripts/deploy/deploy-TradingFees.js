// imports
const { ethers, run, network } = require("hardhat");
const {
    networkConfig,
    developmentChain,
} = require("../../helper-hardhat-config");

// async main
async function main() {
    const tradingfees = await ethers.getContractFactory("TradingFees");
    console.log("Deploying TradingFees contract...");

    const chainId = network.config.chainId;

    const tradingFees = await tradingfees.deploy(
        "0x2Eca751b14452a8Ba01DF9f698656112900c514c"
    );
    await tradingFees.deployed();
    console.log(`Deployed contract to: ${tradingFees.address}`);
    // what happens when we deploy to our hardhat network?
    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");
        await tradingFees.deployTransaction.wait(6);
        await verify(tradingFees.address, [
            "0x2Eca751b14452a8Ba01DF9f698656112900c514c",
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
