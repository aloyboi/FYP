const networkConfig = {
    31337: {
        //mainnet-fork
        name: "localhost",
        lendingPoolAddressesProvider:
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",

        wethToken: {
            name: "WETH",
            tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
        daiToken: {
            name: "DAI",
            tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        },
        priceFeeds: {
            DAI_ETH: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        },
    },
    // Due to the changing testnets, this testnet might not work as shown in the video
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        wethToken: "0xCCa7d1416518D095E729904aAeA087dBA749A4dC",
        ethToken: "0x5E2bD269dC9f5c0E3E112AA821afC9eB778Be880",
        // This is the AaveV2 Lending Pool Addresses Provider
        lendingPoolAddressesProvider:
            "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
        // This is LINK/ETH feed
        daiEthPriceFeed: "0xb4c4a493AB6356497713A78FFA6c60FB53517c63",
        // This is the daiToken token
        daiToken: "0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33",
    },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
};
