const { expect, assert } = require("chai");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const WalletABI = require("../artifacts/contracts/Wallet.sol/Wallet.json");
const AmmABI = require("../artifacts/contracts/AMM.sol/AMM.json");
const { ethers } = require("hardhat");
const ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const ABI = require("../TokenABIS/tokenABI.json");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber } = require("ethers");
const { order } = require("styled-system");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

async function matchBuyOrders(_tokenA, _tokenB, _id, exchange, amm) {
    let saleTokenAmt;
    let orderstoFill = [];
    let buy;

    try {
        [buy, x] = await exchange.getOrderFromArray(_tokenA, _tokenB, "0", _id);

        let buyOrderToFill = [...buy];
        buyOrderToFill[0] = ethers.BigNumber.from(buyOrderToFill[0]);
        buyOrderToFill[1] = ethers.BigNumber.from(buyOrderToFill[1]);
        buyOrderToFill[4] = ethers.BigNumber.from(buyOrderToFill[4]);
        buyOrderToFill[6] = ethers.BigNumber.from(buyOrderToFill[6]);
        buyOrderToFill[7] = ethers.BigNumber.from(buyOrderToFill[7]);
        buyOrderToFill[8] = ethers.BigNumber.from(buyOrderToFill[8]);
        buyOrderToFill[9] = ethers.BigNumber.from(buyOrderToFill[9]);

        length = await exchange.getOrderLength("1", _tokenA, _tokenB);
        length = ethers.BigNumber.from(length);

        let i = ethers.BigNumber.from(0);

        //all in 18 decimals
        for (let i = 0; i < length; i++) {
            let order = await exchange.getOrder(_tokenA, _tokenB, i, "1");
            let modifiedOrder = [...order];
            modifiedOrder[0] = ethers.BigNumber.from(modifiedOrder[0]);
            modifiedOrder[1] = ethers.BigNumber.from(modifiedOrder[1]);
            modifiedOrder[4] = ethers.BigNumber.from(modifiedOrder[4]);
            modifiedOrder[6] = ethers.BigNumber.from(modifiedOrder[6]);
            modifiedOrder[7] = ethers.BigNumber.from(modifiedOrder[7]);
            modifiedOrder[8] = ethers.BigNumber.from(modifiedOrder[8]);
            modifiedOrder[9] = ethers.BigNumber.from(modifiedOrder[9]);

            //Check Rate satisfies trade conditions and same users cannot fill their own orders
            if (
                modifiedOrder[7].lte(buyOrderToFill[7]) &&
                modifiedOrder[2] != buyOrderToFill[2]
            ) {
                {
                    buyOrderToFill[4].gt(modifiedOrder[4])
                        ? (saleTokenAmt = modifiedOrder[4])
                        : (saleTokenAmt = buyOrderToFill[4]);
                }

                let buyOrder = [
                    ethers.BigNumber.from(_id),
                    "0",
                    saleTokenAmt,
                    modifiedOrder[7],
                ]; //orderId, side, amountFilled, rate
                let sellOrder = [
                    modifiedOrder[0],
                    "1",
                    saleTokenAmt,
                    modifiedOrder[7],
                ]; //orderId, side, amountFilled, rate

                orderstoFill.push(buyOrder);
                orderstoFill.push(sellOrder);

                buyOrderToFill[4] = buyOrderToFill[4].sub(saleTokenAmt);

                if (buyOrderToFill[4] == 0) break;
            }
        }

        //Convert to solidity type
        let solidityArray = new Array(orderstoFill.length);
        for (let i = 0; i < orderstoFill.length; i++) {
            solidityArray[i] = new Array(orderstoFill[i].length);

            for (let j = 0; j < orderstoFill[i].length; j++) {
                solidityArray[i][j] = orderstoFill[i][j].toString();
            }
        }
        const fill = await amm.fillOrder(_tokenA, _tokenB, solidityArray, {
            gasLimit: 15000000,
        });

        await fill.wait();
    } catch (error) {
        console.log(error);
    }
}

async function matchSellOrders(_tokenA, _tokenB, _id, exchange, amm) {
    let saleTokenAmt;
    let orderstoFill = [];
    let sell;
    let i;

    try {
        [sell, x] = await exchange.getOrderFromArray(
            _tokenA,
            _tokenB,
            "1",
            _id
        );

        let sellOrderToFill = [...sell];
        sellOrderToFill[0] = ethers.BigNumber.from(sellOrderToFill[0]);
        sellOrderToFill[1] = ethers.BigNumber.from(sellOrderToFill[1]);
        sellOrderToFill[4] = ethers.BigNumber.from(sellOrderToFill[4]);
        sellOrderToFill[6] = ethers.BigNumber.from(sellOrderToFill[6]);
        sellOrderToFill[7] = ethers.BigNumber.from(sellOrderToFill[7]);
        sellOrderToFill[8] = ethers.BigNumber.from(sellOrderToFill[8]);
        sellOrderToFill[9] = ethers.BigNumber.from(sellOrderToFill[9]);

        length = await exchange.getOrderLength("0", _tokenA, _tokenB);
        length = ethers.BigNumber.from(length);

        let i = ethers.BigNumber.from(0);

        //all in 18 decimals
        for (let i = 0; i < length; i++) {
            let order = await exchange.getOrder(_tokenA, _tokenB, i, "0");
            let modifiedOrder = [...order];
            modifiedOrder[0] = ethers.BigNumber.from(modifiedOrder[0]);
            modifiedOrder[1] = ethers.BigNumber.from(modifiedOrder[1]);
            modifiedOrder[4] = ethers.BigNumber.from(modifiedOrder[4]);
            modifiedOrder[6] = ethers.BigNumber.from(modifiedOrder[6]);
            modifiedOrder[7] = ethers.BigNumber.from(modifiedOrder[7]);
            modifiedOrder[8] = ethers.BigNumber.from(modifiedOrder[8]);
            modifiedOrder[9] = ethers.BigNumber.from(modifiedOrder[9]);

            //Check Rate satisfies trade conditions and same users cannot fill their own orders
            if (
                modifiedOrder[7].gte(sellOrderToFill[7]) &&
                modifiedOrder[2] != sellOrderToFill[2]
            ) {
                {
                    sellOrderToFill[4].gt(modifiedOrder[4])
                        ? (saleTokenAmt = modifiedOrder[4])
                        : (saleTokenAmt = sellOrderToFill[4]);
                }

                let sellOrder = [
                    ethers.BigNumber.from(_id),
                    "1",
                    saleTokenAmt,
                    modifiedOrder[7],
                ]; //orderId, side, amountFilled, rate
                let buyOrder = [
                    modifiedOrder[0],
                    "0",
                    saleTokenAmt,
                    modifiedOrder[7],
                ]; //orderId, side, amountFilled, rate

                orderstoFill.push(sellOrder);
                orderstoFill.push(buyOrder);

                sellOrderToFill[4] = sellOrderToFill[4].sub(saleTokenAmt);

                if (sellOrderToFill[4] == 0) break;
            }
        }

        //Convert to solidity type
        let solidityArray = new Array(orderstoFill.length);
        for (let i = 0; i < orderstoFill.length; i++) {
            solidityArray[i] = new Array(orderstoFill[i].length);

            for (let j = 0; j < orderstoFill[i].length; j++) {
                solidityArray[i][j] = orderstoFill[i][j].toString();
            }
        }
        const fill = await amm.fillOrder(_tokenA, _tokenB, solidityArray, {
            gasLimit: 15000000,
        });
        await fill.wait();
    } catch (error) {
        console.log(error);
    }
}

describe("AMM", async function () {
    let amountA;
    let amountB;
    let amountAInDecimals;
    let amountBInDecimals;
    let ethAdd;
    let decimals;
    let rate;
    let rateInDecimals;

    let Wallet;
    let wallet1, wallet2, wallet3;
    let dai;
    let walletAdd;
    let usdc;
    let usdcAdd;
    let exchangeAdd;
    let Exchange;

    const testwallet1 = process.env.TEST_WALLET_1;
    const testwallet2 = process.env.TEST_WALLET_2;
    const testwallet3 = process.env.TEST_WALLET_3;

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

        await helpers.impersonateAccount(testwallet3);
        wallet3 = await ethers.getSigner(testwallet3);

        //Wallet Contract
        walletAdd = "0xc1ee82417b4374d04451b67ce26a2cbe9647505e";
        Wallet = new ethers.Contract(walletAdd, WalletABI.abi, wallet1);

        //Exchange Contract
        exchangeAdd = "0xf9a807cc8fe9439df69708423fbc2e5697ecd4b3";
        Exchange = new ethers.Contract(exchangeAdd, ExchangeABI.abi, wallet1);

        //AMM contract
        ammAdd = "0x30cfc66dbd17dda106bb5ef2856c4c842b70fb33";
        AMM = new ethers.Contract(ammAdd, AmmABI.abi, wallet1);

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
        amountA = "0.01";
        amountAInDecimals = ethers.utils.parseUnits(amountA, decimals);
        amountB = "15";
        amountBInDecimals = ethers.utils.parseUnits(amountB, decimals);
        rate = (amountBInDecimals / amountAInDecimals).toString();

        rateInDecimals = ethers.utils.parseUnits(rate, decimals);
        ethAdd = "0x0000000000000000000000000000000000000000";
    });

    describe("Filling Orders", async function () {
        it("Should completely fill a Buy & Sell Order", async function () {
            //Create a Buy Order
            const approve = await dai
                .connect(wallet1)
                .approve(Wallet.address, amountBInDecimals.toString());

            const depositToken = await Wallet.connect(wallet1).depositToken(
                dai.address,
                amountBInDecimals.toString(),
                18
            );

            bal = await Wallet.balanceOf(dai.address, wallet1.address);

            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                dai.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            locked = await Wallet.lockedFunds(wallet1.address, dai.address);
            expect(locked.toString()).to.be.equal(amountBInDecimals.toString());

            //Create a Sell Order
            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellOrderId = await Exchange.s_orderId();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                amountAInDecimals,
                dai.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            locked = await Wallet.getlockedFunds(wallet2.address, ethAdd);
            expect(locked.toString()).to.be.equal(amountAInDecimals.toString());

            //Match Order
            await expect(
                matchSellOrders(
                    ethAdd,
                    dai.address,
                    sellOrderId.toString(),
                    Exchange,
                    AMM
                )
            ).to.not.be.rejected;

            //Orders should not exist
            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, dai.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, dai.address)
            ).to.be.equal(false);
        });

        it("Should partially fill a Buy Order", async function () {
            //Create a Buy Order
            const approve = await usdc
                .connect(wallet1)
                .approve(
                    Wallet.address,
                    (amountBInDecimals / 10 ** 12).toString()
                );

            const depositToken = await Wallet.connect(wallet1).depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );

            bal = await Wallet.balanceOf(usdc.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                usdc.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            //Create a Sell Order
            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            //change to verify
            const sellAmount = (0.001 * 10 ** 18).toString();
            const sellOrderId = await Exchange.s_orderId();
            const value = ((sellAmount * rateInDecimals) / 10 ** 18).toString();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                sellAmount,
                usdc.address,
                value,
                rateInDecimals,
                false
            );

            //Match Order
            const fillOrder = await matchSellOrders(
                ethAdd,
                usdc.address,
                sellOrderId.toString(),
                Exchange,
                AMM
            );

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, usdc.address)
            ).to.be.equal(true);

            locked = await Wallet.lockedFunds(wallet1.address, usdc.address);
            expect(locked.toString()).to.be.equal(
                ((amountAInDecimals - sellAmount) * rate).toString()
            );

            lock = await Wallet.lockedFunds(wallet2.address, ethAdd);
            expect(lock.toString()).to.be.equal("0");

            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, usdc.address)
            ).to.be.equal(false);

            //Balance should be updated

            //Buyer
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     sellAmount
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal((totalAmount - sellAmount * price).toString());

            // //Seller
            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     (amountInDecimals - sellAmount).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal((sellAmount * price).toString());

            //Verify Remaining Buy Order
            const remainingBuyOrder = await Exchange.getOrder(
                ethAdd,
                usdc.address,
                0,
                0
            );
            expect(remainingBuyOrder.amountA.toString()).to.be.equal(
                (amountAInDecimals - sellAmount).toString()
            );
        });

        it("Should partially fill a Sell Order", async function () {
            //Create a Buy Order
            const approve = await usdc
                .connect(wallet1)
                .approve(
                    Wallet.address,
                    (amountBInDecimals / 10 ** 12).toString()
                );

            const depositToken = await Wallet.connect(wallet1).depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );

            //change to verify
            const buyAmount = 0.002 * 10 ** 18;

            bal = await Wallet.balanceOf(usdc.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const value = (buyAmount * rate).toString();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                buyAmount.toString(),
                usdc.address,
                value,
                rateInDecimals,
                false
            );

            //Create a Sell Order
            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellOrderId = await Exchange.s_orderId();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                amountAInDecimals,
                usdc.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            //Match Order
            const fillOrder = await matchSellOrders(
                ethAdd,
                usdc.address,
                sellOrderId.toString(),
                Exchange,
                AMM
            );

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, usdc.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, usdc.address)
            ).to.be.equal(true);
            locked = await Wallet.lockedFunds(wallet2.address, ethAdd);
            expect(locked.toString()).to.be.equal(
                (amountAInDecimals - buyAmount).toString()
            );
            lock = await Wallet.lockedFunds(wallet1.address, usdc.address);
            expect(lock.toString()).to.be.equal("0");

            //Balance should be updated

            // Buyer
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     buyAmount
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal((totalAmount - buyAmount * price).toString());

            // //Seller
            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     (amountInDecimals - buyAmount).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal((buyAmount * price).toString());

            //Verify Sell Order Remaining Amount
            const remainingSellOrder = await Exchange.getOrder(
                ethAdd,
                usdc.address,
                0,
                1
            );
            expect(remainingSellOrder.amountA.toString()).to.be.equal(
                (amountAInDecimals - buyAmount).toString()
            );
        });

        it("Should fill Sell Order if Price Target of Sell Order is met, takes SellPrice of whichever is higher", async function () {
            //Create a Buy Order
            const approve = await usdc
                .connect(wallet1)
                .approve(
                    Wallet.address,
                    (amountBInDecimals / 10 ** 12).toString()
                );

            const depositToken = await Wallet.connect(wallet1).depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );

            bal = await Wallet.balanceOf(usdc.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                usdc.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            //Create a Sell Order
            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            //rate
            const sellPrice = ethers.utils.parseUnits("0.42", decimals);

            const sellOrderId = await Exchange.s_orderId();
            const value = (
                (sellPrice * amountAInDecimals) /
                10 ** 18
            ).toString();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                amountAInDecimals,
                usdc.address,
                value,
                sellPrice,
                false
            );

            // //Match Order
            const fillOrder = await matchSellOrders(
                ethAdd,
                usdc.address,
                sellOrderId.toString(),
                Exchange,
                AMM
            );

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, usdc.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, usdc.address)
            ).to.be.equal(false);

            locked = await Wallet.lockedFunds(wallet1.address, usdc.address);
            expect(locked.toString()).to.be.equal("0");
            locked = await Wallet.lockedFunds(wallet2.address, ethAdd);
            expect(locked.toString()).to.be.equal("0");

            //Balance should be updated, in this case buyer's buy price is selected since it is higher than sell price

            //Buyer
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     amountInDecimals
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal((totalAmount - amountInDecimals * price).toString());

            // //Seller
            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     0
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal(totalAmount.toString());

            //Verify Filled Order
            const fillBuyOrder = await Exchange.getFilledOrder(
                wallet1.address,
                0,
                0
            );
            expect(fillBuyOrder.amountFilled.toString()).to.be.equal(
                amountAInDecimals.toString()
            );
            expect(fillBuyOrder.fillRate.toString()).to.be.equal(
                rateInDecimals.toString()
            );

            const fillSellOrder = await await Exchange.getFilledOrder(
                wallet2.address,
                1,
                0
            );
            expect(fillSellOrder.amountFilled.toString()).to.be.equal(
                amountAInDecimals.toString()
            );
            expect(fillBuyOrder.fillRate.toString()).to.be.equal(
                rateInDecimals.toString()
            );
        });

        it("Should fill Buy Order if Price Target of Buy Order is met, takes buyPrice of whichever is higher", async function () {
            //Create a Buy Order
            const approve = await dai
                .connect(wallet1)
                .approve(Wallet.address, amountBInDecimals);

            const depositToken = await Wallet.connect(wallet1).depositToken(
                dai.address,
                amountBInDecimals,
                18
            );
            bal = await Wallet.balanceOf(dai.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                dai.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            //Create a Sell Order
            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellPrice = "1400";
            const sellPriceInDecimals = ethers.utils.parseUnits(
                sellPrice,
                decimals
            );
            const value = (sellPriceInDecimals * amountA).toString();

            const sellOrderId = await Exchange.s_orderId();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                amountAInDecimals,
                dai.address,
                value,
                sellPriceInDecimals,
                false
            );

            // //Match Order
            const fillOrder = await matchBuyOrders(
                ethAdd,
                dai.address,
                buyOrderId.toString(),
                Exchange,
                AMM
            );

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, dai.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, dai.address)
            ).to.be.equal(false);
            expect(
                (
                    await Wallet.lockedFunds(wallet1.address, dai.address)
                ).toString()
            ).to.be.equal("0");
            expect(
                (await Wallet.lockedFunds(wallet2.address, ethAdd)).toString()
            ).to.be.equal("0");

            //Balance should be updated, in this case buyer's buy price is selected since it is higher than sell price

            //Buyer
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     amountInDecimals
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal(
            //     (totalAmount - amountInDecimals * sellPrice).toString()
            // );

            // //Seller
            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     0
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal((amountInDecimals * sellPrice).toString());

            //Verify Filled Order
            const fillBuyOrder = await Exchange.getFilledOrder(
                wallet1.address,
                0,
                0
            );
            expect(fillBuyOrder.amountFilled.toString()).to.be.equal(
                amountAInDecimals.toString()
            );
            expect(fillBuyOrder.fillRate.toString()).to.be.equal(
                sellPriceInDecimals.toString()
            );

            const fillSellOrder = await await Exchange.getFilledOrder(
                wallet2.address,
                1,
                0
            );
            expect(fillSellOrder.amountFilled.toString()).to.be.equal(
                amountAInDecimals.toString()
            );
            expect(fillSellOrder.fillRate.toString()).to.be.equal(
                sellPriceInDecimals.toString()
            );
        });

        it("Should not fill Buy/Sell Order if Price Target of Order is not met", async function () {
            //Create a Buy Order
            const approve = await dai
                .connect(wallet1)
                .approve(Wallet.address, amountBInDecimals);

            const depositToken = await Wallet.connect(wallet1).depositToken(
                dai.address,
                amountBInDecimals,
                18
            );

            bal = await Wallet.balanceOf(dai.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                dai.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            //Create a Sell Order
            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellPrice = "2000";
            const sellPriceInDecimals = ethers.utils.parseUnits(
                sellPrice,
                decimals
            );
            const value = (sellPriceInDecimals * amountA).toString();

            const sellOrderId = await Exchange.s_orderId();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                amountAInDecimals,
                dai.address,
                value,
                sellPriceInDecimals,
                false
            );

            //Match Order
            const fillOrder = await matchBuyOrders(
                ethAdd,
                dai.address,
                buyOrderId.toString(),
                Exchange,
                AMM
            );

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, dai.address)
            ).to.be.equal(true);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, dai.address)
            ).to.be.equal(true);
            expect(
                (
                    await Wallet.lockedFunds(wallet1.address, dai.address)
                ).toString()
            ).to.be.equal(amountBInDecimals.toString());
            expect(
                (await Wallet.lockedFunds(wallet2.address, ethAdd)).toString()
            ).to.be.equal(amountAInDecimals.toString());

            //Buyer
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     0
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal(totalAmount);

            // //Seller
            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     amountInDecimals
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal(0);
        });

        it("Should fill multiple sell orders that match price target of buy order", async function () {
            //Create a Buy Order
            const approve = await usdc
                .connect(wallet1)
                .approve(
                    Wallet.address,
                    (amountBInDecimals / 10 ** 12).toString()
                );

            const depositToken = await Wallet.connect(wallet1).depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );

            bal = await Wallet.balanceOf(usdc.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                amountAInDecimals,
                usdc.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            const depositETH = await Wallet.connect(wallet2).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet2.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellOrderId = await Exchange.s_orderId();
            const sellOrder = await Exchange.connect(
                wallet2
            ).createLimitSellOrder(
                ethAdd,
                (0.005 * 10 ** 18).toString(), //amount to sell
                usdc.address,
                (0.005 * rateInDecimals).toString(),
                rateInDecimals,
                false
            );

            const depositETH1 = await Wallet.connect(wallet3).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet3.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellOrderId1 = await Exchange.s_orderId();
            const sellOrder1 = await Exchange.connect(
                wallet3
            ).createLimitSellOrder(
                ethAdd,
                (0.003 * 10 ** 18).toString(),
                usdc.address,
                (0.003 * rateInDecimals).toString(),
                rateInDecimals,
                false
            );

            //Match Order
            const fillOrder = await matchBuyOrders(
                ethAdd,
                usdc.address,
                buyOrderId.toString(),
                Exchange,
                AMM
            );

            order1 = await Exchange.getOrder(ethAdd, usdc.address, 0, 0);

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, usdc.address)
            ).to.be.equal(true);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, usdc.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(
                    sellOrderId1,
                    1,
                    ethAdd,
                    usdc.address
                )
            ).to.be.equal(false);

            expect(
                (
                    await Wallet.lockedFunds(wallet1.address, usdc.address)
                ).toString()
            ).to.be.equal((0.002 * 10 ** 18 * rate).toString());
            expect(
                (await Wallet.lockedFunds(wallet2.address, ethAdd)).toString()
            ).to.be.equal("0");
            expect(
                (await Wallet.lockedFunds(wallet3.address, ethAdd)).toString()
            ).to.be.equal("0");

            //Buyer
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     (4 * 10 ** 18).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal((totalAmount - 4 * 10 ** 18 * price).toString());

            // //Sellers
            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     (amountInDecimals - 1 * 10 ** 18).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal((1 * 10 ** 18 * price).toString());

            // expect(await Exchange.s_tokens(ethAdd, addr2.address)).to.be.equal(
            //     (amountInDecimals - 3 * 10 ** 18).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr2.address)
            // ).to.be.equal((3 * 10 ** 18 * price).toString());

            //Verify Filled Order
            //Remaining Buy Order
            const remainingBuyOrder = await Exchange.getOrder(
                ethAdd,
                usdc.address,
                0,
                0
            );
            expect(remainingBuyOrder.amountA.toString()).to.be.equal(
                (0.002 * 10 ** 18).toString()
            );

            const fillBuyOrder = await Exchange.s_filledOrders(
                wallet1.address,
                0,
                0
            );
            expect(fillBuyOrder.amountFilled.toString()).to.be.equal(
                (0.005 * 10 ** 18).toString()
            );

            const fillBuyOrder1 = await Exchange.s_filledOrders(
                wallet1.address,
                0,
                1
            );
            expect(fillBuyOrder1.amountFilled.toString()).to.be.equal(
                (0.003 * 10 ** 18).toString()
            );

            //First Sell Order
            const fillSellOrder = await Exchange.s_filledOrders(
                wallet2.address,
                1,
                0
            );
            expect(fillSellOrder.amountFilled.toString()).to.be.equal(
                (0.005 * 10 ** 18).toString()
            );

            //Second Sell Order
            const fillSellOrder1 = await Exchange.s_filledOrders(
                wallet3.address,
                1,
                0
            );
            expect(fillSellOrder1.amountFilled.toString()).to.be.equal(
                (0.003 * 10 ** 18).toString()
            );
        });

        it("Should fill multiple buy orders that match price target of sell order", async function () {
            //Create multiple Buy Orders
            const approve = await usdc
                .connect(wallet1)
                .approve(
                    Wallet.address,
                    (amountBInDecimals / 10 ** 12).toString()
                );

            const depositToken = await Wallet.connect(wallet1).depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );
            bal = await Wallet.balanceOf(usdc.address, wallet1.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId = await Exchange.s_orderId();
            const buyOrder = await Exchange.createLimitBuyOrder(
                ethAdd,
                (0.002 * 10 ** 18).toString(),
                usdc.address,
                (0.002 * rateInDecimals).toString(),
                rateInDecimals,
                false
            );

            const approve1 = await usdc
                .connect(wallet2)
                .approve(
                    Wallet.address,
                    (amountBInDecimals / 10 ** 12).toString()
                );

            const depositToken1 = await Wallet.connect(wallet2).depositToken(
                usdc.address,
                (amountBInDecimals / 10 ** 12).toString(),
                6
            );

            bal = await Wallet.balanceOf(usdc.address, wallet2.address);
            expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

            const buyOrderId1 = await Exchange.s_orderId();
            const buyOrder1 = await Exchange.connect(
                wallet2
            ).createLimitBuyOrder(
                ethAdd,
                (0.006 * 10 ** 18).toString(),
                usdc.address,
                (0.006 * rateInDecimals).toString(),
                rateInDecimals,
                false
            );

            const depositETH = await Wallet.connect(wallet3).depositETH({
                value: amountAInDecimals,
            });

            bal = await Wallet.balanceOf(ethAdd, wallet3.address);
            expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

            const sellOrderId = await Exchange.s_orderId();
            const sellOrder = await Exchange.connect(
                wallet3
            ).createLimitSellOrder(
                ethAdd,
                amountAInDecimals,
                usdc.address,
                amountBInDecimals,
                rateInDecimals,
                false
            );

            //Match Order
            const fillOrder = await matchSellOrders(
                ethAdd,
                usdc.address,
                sellOrderId.toString(),
                Exchange,
                AMM
            );

            expect(
                await Exchange.orderExists(buyOrderId, 0, ethAdd, usdc.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(buyOrderId1, 0, ethAdd, usdc.address)
            ).to.be.equal(false);
            expect(
                await Exchange.orderExists(sellOrderId, 1, ethAdd, usdc.address)
            ).to.be.equal(true);

            expect(
                (
                    await Wallet.lockedFunds(wallet1.address, usdc.address)
                ).toString()
            ).to.be.equal("0");
            expect(
                (
                    await Wallet.lockedFunds(wallet2.address, usdc.address)
                ).toString()
            ).to.be.equal("0");
            expect(
                (await Wallet.lockedFunds(wallet3.address, ethAdd)).toString()
            ).to.be.equal((0.002 * 10 ** 18).toString());

            // Buyers;
            // expect(await Exchange.s_tokens(ethAdd, owner.address)).to.be.equal(
            //     (2 * 10 ** 18).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, owner.address)
            // ).to.be.equal((totalAmount - 2 * 10 ** 18 * price).toString());

            // expect(await Exchange.s_tokens(ethAdd, addr1.address)).to.be.equal(
            //     (2 * 10 ** 18).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr1.address)
            // ).to.be.equal((totalAmount - 2 * 10 ** 18 * price).toString());

            // //Seller
            // expect(await Exchange.s_tokens(ethAdd, addr2.address)).to.be.equal(
            //     (amountInDecimals - 4 * 10 ** 18).toString()
            // );
            // expect(
            //     await Exchange.s_tokens(testUSDC.address, addr2.address)
            // ).to.be.equal((4 * 10 ** 18 * price).toString());

            // Verify Filled Order
            // Remaining Sell Order
            const remainingSellOrder = await Exchange.getOrder(
                ethAdd,
                usdc.address,
                0,
                1
            );
            expect(remainingSellOrder.amountA.toString()).to.be.equal(
                (0.002 * 10 ** 18).toString()
            );

            const fillSellOrder = await Exchange.s_filledOrders(
                wallet3.address,
                1,
                0
            );
            expect(fillSellOrder.amountFilled.toString()).to.be.equal(
                (0.002 * 10 ** 18).toString()
            );

            const fillSellOrder1 = await Exchange.s_filledOrders(
                wallet3.address,
                1,
                1
            );
            expect(fillSellOrder1.amountFilled.toString()).to.be.equal(
                (0.006 * 10 ** 18).toString()
            );

            //First Buy Order
            const fillBuyOrder = await Exchange.s_filledOrders(
                wallet1.address,
                0,
                0
            );
            expect(fillBuyOrder.amountFilled.toString()).to.be.equal(
                (0.002 * 10 ** 18).toString()
            );

            // //Second Buy Order
            const fillBuyOrder1 = await Exchange.s_filledOrders(
                wallet2.address,
                0,
                1
            );
            expect(fillBuyOrder1.amountFilled.toString()).to.be.equal(
                (0.006 * 10 ** 18).toString()
            );
        });
    });
});
