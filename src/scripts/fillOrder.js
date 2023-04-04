const { createLimitBuyOrder } = require("../function-transpiled.js");

async function main() {
    // Call the createLimitBuyOrder function here
    await createLimitBuyOrder(
        "0xBa8DCeD3512925e52FE67b1b5329187589072A55",
        "1000000000000000000",
        "0x65aFADD39029741B3b8f0756952C74678c9cEC93",
        "2000000000000000000",
        "2000000000000000000",
        false
    );
}

// Run the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
