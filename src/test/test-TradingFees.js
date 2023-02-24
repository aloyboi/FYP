const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("TradingFees", async () => {
    let owner;
    let addr1;
    let addr2;
    let addrs;
    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        PriceChecker = await ethers.getContractFactory("PriceChecker");
        priceChecker = await TradingFees.deploy();

        TradingFees = await ethers.getContractFactory("TradingFees");

        tradingFees = await TradingFees.deploy();
    });

    describe("Check if fees calculated correctly", async () => {
        const tx = await PriceChecker.addPriceFeed("testToken");
    });
});
