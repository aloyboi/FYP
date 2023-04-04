// imports
const { ethers, run, network } = require("hardhat");
const {
    networkConfig,
    developmentChain,
} = require("../../helper-hardhat-config");

// async main
async function main() {
    const amm = await ethers.getContractFactory("AMM");
    console.log("Deploying AMM contract...");

    const chainId = network.config.chainId;

    const AMM = await amm.deploy(
        "0xd725695C1db08730386463D0e4e2C8A9d5D9C1A4",
        "0xFdf2CAa88ceC5D43b627b4b3694aFF291Da69570",
        "0xb519733321EC872236016517FE0be29951741C52"
    );
    await AMM.deployed();
    console.log(`Deployed contract to: ${AMM.address}`);
    // what happens when we deploy to our hardhat network?
    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");
        await AMM.deployTransaction.wait(6);
        await verify(AMM.address, [
            "0xd725695C1db08730386463D0e4e2C8A9d5D9C1A4",
            "0xFdf2CAa88ceC5D43b627b4b3694aFF291Da69570",
            "0xb519733321EC872236016517FE0be29951741C52",
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
