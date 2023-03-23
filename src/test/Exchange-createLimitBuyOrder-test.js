const { expect, assert } = require("chai");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const WalletABI = require("../artifacts/contracts/Wallet.sol/Wallet.json");
const { ethers } = require("hardhat");
const ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const ABI = require("../TokenABIS/tokenABI.json");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

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
    let daiABI;
    let walletAdd;
    let usdc;
    let usdcAdd;
    let exchangeAdd;
    let Exchange;

    const testwallet1 = process.env.TEST_WALLET_1;

    beforeEach(async function () {
        await helpers.impersonateAccount(testwallet1);
        wallet1 = await ethers.getSigner(testwallet1);

        //Wallet Contract
        walletAdd = "0x5Dc42ED6fda286668E899Ff73EE99E87116a33EB";
        Wallet = new ethers.Contract(walletAdd, WalletABI.abi, wallet1);

        //Exchange Contract
        exchangeAdd = "0x64a2aBa949Fd518c8bA52906C628A0B50549F16b";
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
        amountA = "10";
        amountAInDecimals = ethers.utils.parseUnits(amountA, decimals);
        amountB = "15";
        amountBInDecimals = ethers.utils.parseUnits(amountB, decimals);
        rate = (amountBInDecimals / amountAInDecimals).toString();

        rateInDecimals = ethers.utils.parseUnits(rate, decimals);
        ethAdd = "0x0000000000000000000000000000000000000000";
    });

    describe("Creating new Limit Buy Orders", async function () {
        it("Should not allow new Limit Buy Orders if insufficient USDC deposited to buy", async function () {
            await expect(
                Exchange.createLimitBuyOrder(
                    ethAdd,
                    amountAInDecimals,
                    usdc.address,
                    amountBInDecimals,
                    rateInDecimals,
                    false
                )
            ).to.be.rejectedWith("Insufficient Funds");
        });

        it("Should create a new Limit Buy Order if sufficient USDC deposited to fill buy order", async function () {
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
            const locked = await Wallet.connect(wallet1).getlockedFunds(
                dai.address,
                wallet1.address
            );
            console.log(balance.toString());
            expect((balance - locked).toString()).to.be.equal(
                amountBInDecimals.toString()
            );
            // Place buy order for ETH
            const orderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.connect(
                wallet1
            ).createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                dai,
                "1",
                rateInDecimals,
                false
            );
            // const newOrderId = await Exchange.s_orderId();
            // expect(
            //     await Exchange.lockedFunds(wallet1.address, usdc.address)
            // ).to.be.equal(totalAmount.toString());

            // await expect(newOrderId).to.be.equal(orderId + 1);
            // await expect(
            //     Exchange.createLimitBuyOrder(
            //         ethAdd,
            //         amountInDecimals,
            //         usdc.address,
            //         totalAmount,
            //         priceInDecimals,
            //         false
            //     )
            // ).to.be.revertedWith("Insufficient Funds");
        });

        it("Should not allow new Limit Buy Orders if token not available on DEX", async function () {
            const approve = await usdc
                .connect(wallet1)
                .approve(Wallet.address, amountBInDecimals);
            const depositToken = await Wallet.depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );
            await expect(
                //Solana given
                Exchange.createLimitBuyOrder(
                    "0x41848d32f281383f214c69b7b248dc7c2e0a7374",
                    amountAInDecimals,
                    usdc.address,
                    amountBInDecimals,
                    rate,
                    false
                )
            ).to.be.rejectedWith("Token unavailable in DEX");
        });
    });
});
