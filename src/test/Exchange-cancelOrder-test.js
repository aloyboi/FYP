const { expect, assert } = require("chai");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const WalletABI = require("../artifacts/contracts/Wallet.sol/Wallet.json");
const { ethers } = require("hardhat");
const ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const ABI = require("../TokenABIS/tokenABI.json");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

describe("Exchange", async function () {
    let amountA;
    let amountB;
    let amountAInDecimals;
    let amountBInDecimals;
    let ethAdd;
    let decimals;
    let rate;
    let rateInDecimals;

    let Wallet;
    let ethADD;
    let wallet1, wallet2;
    let dai;
    let walletAdd;
    let usdc;
    let usdcAdd;
    let exchangeAdd;
    let Exchange;

    const testwallet1 = process.env.TEST_WALLET_1;
    const testwallet2 = process.env.TEST_WALLET_2;

    beforeEach(async function () {
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: GOERLI_RPC_URL,
                        blockNumber: 8804292,
                    },
                },
            ],
        });

        await helpers.impersonateAccount(testwallet1);
        wallet1 = await ethers.getSigner(testwallet1);

        await helpers.impersonateAccount(testwallet2);
        wallet2 = await ethers.getSigner(testwallet2);

        //Wallet Contract
        walletAdd = "0xc1ee82417b4374d04451b67ce26a2cbe9647505e";
        Wallet = new ethers.Contract(walletAdd, WalletABI.abi, wallet1);

        //Exchange Contract
        exchangeAdd = "0xf9a807cc8fe9439df69708423fbc2e5697ecd4b3";
        Exchange = new ethers.Contract(exchangeAdd, ExchangeABI.abi, wallet1);
        ethADD = "0x0000000000000000000000000000000000000000";

        //DAI token
        daiAdd = "0xBa8DCeD3512925e52FE67b1b5329187589072A55";
        dai = new ethers.Contract(
            daiAdd,
            ABI.daiABI,
            ethers.provider.getSigner()
        );

        //USD token contract
        usdcAdd = "0x65aFADD39029741B3b8f0756952C74678c9cEC93";
        usdc = new ethers.Contract(
            usdcAdd,
            ABI.usdABI,
            ethers.provider.getSigner()
        );

        decimals = 18;
        amountA = "0.001";
        amountAInDecimals = ethers.utils.parseUnits(amountA, decimals);
        amountB = "15";
        amountBInDecimals = ethers.utils.parseUnits(amountB, decimals);
        rate = (amountBInDecimals / amountAInDecimals).toString();

        rateInDecimals = ethers.utils.parseUnits(rate, decimals);
        ethAdd = "0x0000000000000000000000000000000000000000";
    });

    // describe("Cancelling Orders", async function () {
    it("Should revert when invalid Order Id to cancel order", async function () {
        await expect(
            Exchange.cancelOrder(0, 100, ethAdd, dai.address)
        ).to.be.rejectedWith("Invalid Order ID");
    });

    it("Should cancel a valid Buy Order if is owner ", async function () {
        const approve = await dai
            .connect(wallet1)
            .approve(Wallet.address, amountBInDecimals);

        const depositToken = await Wallet.connect(wallet1).depositToken(
            dai.address,
            amountBInDecimals,
            "18"
        );

        const balance = await Wallet.connect(wallet1).balanceOf(
            dai.address,
            wallet1.address
        );

        expect(balance.toString()).to.be.equal(amountBInDecimals.toString());

        //Place buy order for ETH
        const orderId = await Exchange.s_orderId();
        const buyOrder = await Exchange.createLimitBuyOrder(
            ethAdd,
            amountAInDecimals,
            dai.address,
            amountBInDecimals,
            rateInDecimals,
            false
        );
        //Order should exist
        expect(
            await Exchange.orderExists(orderId, 0, ethAdd, dai.address)
        ).to.be.equal(true);
        locked = await Wallet.lockedFunds(wallet1.address, dai.address);
        expect(locked.toString()).to.be.equal(amountBInDecimals.toString());

        //Cancel buy order
        const cancelOrder = await Exchange.cancelOrder(
            0,
            orderId,
            ethAdd,
            dai.address
        );

        //Order should not exist
        expect(
            await Exchange.orderExists(orderId, 0, ethAdd, dai.address)
        ).to.be.equal(false);
        locked = await Wallet.lockedFunds(wallet1.address, dai.address);
        expect(locked.toString()).to.be.equal("0");
    });

    it("Should cancel a valid Sell Order if it is owner ", async function () {
        const depositETH = await Wallet.depositETH({
            value: amountAInDecimals,
        });

        ethBal = await Wallet.connect(wallet1).balanceOf(
            ethAdd,
            wallet1.address
        );
        daiBal = await Wallet.connect(wallet1).balanceOf(
            dai.address,
            wallet1.address
        );

        expect(ethBal.toString()).to.be.equal(amountAInDecimals.toString());

        //Place sell order for ETH
        const orderId = await Exchange.s_orderId();
        const sellOrder = await Exchange.createLimitSellOrder(
            ethAdd,
            amountAInDecimals,
            dai.address,
            amountBInDecimals,
            rateInDecimals,
            false
        );
        const newOrderId = await Exchange.s_orderId();

        //Order should be valid
        expect(
            await Exchange.orderExists(orderId, 1, ethAdd, dai.address)
        ).to.be.equal(true);
        locked = await Wallet.getlockedFunds(wallet1.address, ethAdd);
        expect(locked.toString()).to.be.equal(amountAInDecimals.toString());

        //Cancel Order
        const cancelOrder = await Exchange.cancelOrder(
            1,
            orderId,
            ethAdd,
            dai.address
        );

        //Order should be invalid
        expect(
            await Exchange.orderExists(orderId, 1, ethAdd, dai.address)
        ).to.be.equal(false);
        locked = await Wallet.getlockedFunds(wallet1.address, ethAdd);
        expect(locked.toString()).to.be.equal("0");
    });

    it("Should not be able to cancel order if not order owner ", async function () {
        const depositETH = await Wallet.depositETH({
            value: amountAInDecimals,
        });

        const test = await Wallet.connect(wallet1).balanceOf(
            ethAdd,
            wallet1.address
        );

        expect(test.toString()).to.be.equal(amountAInDecimals.toString());

        //Place sell order for ETH
        const orderId = await Exchange.s_orderId();
        const sellOrder = await Exchange.createLimitSellOrder(
            ethAdd,
            amountAInDecimals,
            dai.address,
            amountBInDecimals,
            rateInDecimals,
            false
        );
        const newOrderId = await Exchange.s_orderId();

        //Order should be valid
        expect(
            await Exchange.orderExists(orderId, 1, ethAdd, dai.address)
        ).to.be.equal(true);
        //Cancel Order should fail
        await expect(
            Exchange.connect(wallet2).cancelOrder(
                1,
                orderId,
                ethAdd,
                dai.address
            )
        ).to.be.rejectedWith("Not Owner");
    });
    // });
});
