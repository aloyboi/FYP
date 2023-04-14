const { expect, assert } = require("chai");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fillLogicABI = require("../artifacts/contracts/fillLogic.sol/fillLogic.json");
const WalletABI = require("../artifacts/contracts/Wallet.sol/Wallet.json");
const { ethers } = require("hardhat");
const tradingFeeABI = require("../artifacts/contracts/TradingFees.sol/TradingFees.json");
const ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const ABI = require("../TokenABIS/tokenABI.json");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const ERC20 = require("../artifacts/contracts/ERC20.sol/ERC20.json");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

describe("fillLogic & TradingFees", async function () {
    let amountA;
    let amountB;
    let amountAInDecimals;
    let amountBInDecimals;
    let ethAdd;
    let decimals;
    let rate;
    let rateInDecimals;

    let Wallet;
    let wallet1, wallet2;
    let dai, daiAdd;
    let walletAdd;
    let usdc;
    let usdcAdd;
    let exchangeAdd;
    let Exchange;
    let tradingFeeAdd;
    let fillLogicAdd, FillLogic;
    let tradingFee;
    let adaiAdd, aDAI;
    let amountaDAI, amountaDAIInDecimals;

    const testwallet1 = process.env.TEST_WALLET_1;
    const testwallet2 = process.env.TEST_WALLET_2;

    async function approveERC20(_tokenAddress, spenderAddress, amount, signer) {
        const erc20Token = await new ethers.Contract(
            _tokenAddress,
            ERC20.abi,
            signer
        );

        const transaction = await erc20Token.approve(spenderAddress, amount);
        await transaction.wait(1);
    }

    async function matchBuyOrders(_tokenA, _tokenB, _id, exchange, fillLogic) {
        let saleTokenAmt;
        let orderstoFill = [];
        let buy;

        try {
            [buy, x] = await exchange.getOrderFromArray(
                _tokenA,
                _tokenB,
                "0",
                _id
            );

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

            for (let i = 0; i < orderstoFill.length; i++) {
                console.log("Filled amount: " + orderstoFill[i][2].toString());
            }

            //Convert to solidity type
            let solidityArray = new Array(orderstoFill.length);
            for (let i = 0; i < orderstoFill.length; i++) {
                solidityArray[i] = new Array(orderstoFill[i].length);

                for (let j = 0; j < orderstoFill[i].length; j++) {
                    solidityArray[i][j] = orderstoFill[i][j].toString();
                }
            }
            const fill = await fillLogic.fillOrder(
                _tokenA,
                _tokenB,
                solidityArray,
                {
                    gasLimit: 20000000,
                }
            );

            await fill.wait();
        } catch (error) {
            console.log(error);
        }
    }

    async function matchSellOrders(_tokenA, _tokenB, _id, exchange, fillLogic) {
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
            const fill = await fillLogic.fillOrder(
                _tokenA,
                _tokenB,
                solidityArray,
                {
                    gasLimit: 20000000,
                }
            );
            await fill.wait();
        } catch (error) {
            console.log(error);
        }
    }

    beforeEach(async function () {
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: GOERLI_RPC_URL,
                        blockNumber: 8826732,
                    },
                },
            ],
        });

        await helpers.impersonateAccount(testwallet1);
        wallet1 = await ethers.getSigner(testwallet1);

        await helpers.impersonateAccount(testwallet2);
        wallet2 = await ethers.getSigner(testwallet2);

        //Wallet Contract
        walletAdd = "0x11a6540e1357f29cbc9e04a6ac6893089899b6bd";
        Wallet = new ethers.Contract(walletAdd, WalletABI.abi, wallet1);

        //Exchange Contract
        exchangeAdd = "0xf9a807cc8fe9439df69708423fbc2e5697ecd4b3";
        Exchange = new ethers.Contract(exchangeAdd, ExchangeABI.abi, wallet1);

        //fillLogic contract
        fillLogicAdd = "0x36f282cc7d0971d3029696e542db2c06dfd28485";
        FillLogic = new ethers.Contract(
            fillLogicAdd,
            fillLogicABI.abi,
            wallet1
        );

        tradingFeeAdd = "0xFdf2CAa88ceC5D43b627b4b3694aFF291Da69570";
        tradingFee = new ethers.Contract(
            tradingFeeAdd,
            tradingFeeABI.abi,
            wallet1
        );

        //DAI token
        daiAdd = "0xBa8DCeD3512925e52FE67b1b5329187589072A55";
        dai = new ethers.Contract(
            daiAdd,
            ABI.daiABI,
            ethers.provider.getSigner()
        );

        //aDAI token
        adaiAdd = "0xADD98B0342e4094Ec32f3b67Ccfd3242C876ff7a";
        aDAI = new ethers.Contract(
            adaiAdd,
            ABI.adaiABI,
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

        amountaDAI = "50";
        amountaDAIInDecimals = ethers.utils.parseUnits(amountaDAI, decimals);

        rateInDecimals = ethers.utils.parseUnits(rate, decimals);
        ethAdd = "0x0000000000000000000000000000000000000000";

        decimals = 18;
        amountA = "0.001";
        amountAInDecimals = ethers.utils.parseUnits(amountA, decimals);
        amountB = "15";
        amountBInDecimals = ethers.utils.parseUnits(amountB, decimals);
        rate = (amountBInDecimals / amountAInDecimals).toString();

        rateInDecimals = ethers.utils.parseUnits(rate, decimals);
        ethAdd = "0x0000000000000000000000000000000000000000";
    });

    it("Should deduct Tokens if Waive Fees opt but insufficient aDAI", async function () {
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
            true
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
        const sellOrder = await Exchange.connect(wallet2).createLimitSellOrder(
            ethAdd,
            amountAInDecimals,
            dai.address,
            amountBInDecimals,
            rateInDecimals,
            true
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
                FillLogic
            )
        ).to.not.be.rejected;

        const tradingFeeOrder = await tradingFee.calculateFees(
            amountAInDecimals,
            rateInDecimals,
            dai.address
        );

        const amountBuyToDeduct = await tradingFee.amountTokensToDeduct(
            ethAdd,
            tradingFeeOrder
        );

        const amountSellToDeduct = await tradingFee.amountTokensToDeduct(
            dai.address,
            tradingFeeOrder
        );

        const buyerBalanceA = await Wallet.balanceOf(ethAdd, wallet1.address);
        const buyerBalanceB = await Wallet.balanceOf(
            dai.address,
            wallet1.address
        );

        const sellerBalanceA = await Wallet.balanceOf(ethAdd, wallet2.address);
        const sellerBalanceB = await Wallet.balanceOf(
            dai.address,
            wallet2.address
        );

        //Buyer Balance
        expect(buyerBalanceA.toString()).to.be.equal(
            (amountAInDecimals - amountBuyToDeduct).toString()
        );
        expect(buyerBalanceB.toString()).to.be.equal("0");

        //Seller Balance
        expect(sellerBalanceA.toString()).to.be.equal("0");
        expect(sellerBalanceB.toString()).to.be.equal(
            (amountBInDecimals - amountSellToDeduct).toString()
        );
    });

    // it("Should deduct aDAI if Waive Fees opt and sufficient aDAI", async function () {
    //     //Create a Buy Order
    //     const approve = await dai
    //         .connect(wallet1)
    //         .approve(Wallet.address, amountBInDecimals.toString());

    //     const depositToken = await Wallet.connect(wallet1).depositToken(
    //         dai.address,
    //         amountBInDecimals.toString(),
    //         18
    //     );
    //     const approve1 = await approveERC20(
    //         aDAI.address,
    //         Wallet.address,
    //         amountaDAIInDecimals,
    //         wallet1
    //     );

    //     const depositToken1 = await Wallet.connect(wallet1).depositToken(
    //         aDAI.address,
    //         amountaDAIInDecimals,
    //         18
    //     );

    //     bal = await Wallet.balanceOf(dai.address, wallet1.address);

    //     expect(bal.toString()).to.be.equal(amountBInDecimals.toString());

    //     bal = await Wallet.balanceOf(aDAI.address, wallet1.address);
    //     expect(bal.toString()).to.be.equal((50 * 10 ** 18).toString());

    //     const buyOrderId = await Exchange.s_orderId();
    //     const buyOrder = await Exchange.createLimitBuyOrder(
    //         ethAdd,
    //         amountAInDecimals,
    //         dai.address,
    //         amountBInDecimals,
    //         rateInDecimals,
    //         true
    //     );

    //     locked = await Wallet.lockedFunds(wallet1.address, dai.address);
    //     expect(locked.toString()).to.be.equal(amountBInDecimals.toString());

    //     //Create a Sell Order
    //     const depositETH = await Wallet.connect(wallet2).depositETH({
    //         value: amountAInDecimals,
    //     });

    //     bal = await Wallet.balanceOf(ethAdd, wallet2.address);
    //     expect(bal.toString()).to.be.equal(amountAInDecimals.toString());

    //     const approve2 = await approveERC20(
    //         aDAI.address,
    //         Wallet.address,
    //         amountaDAIInDecimals,
    //         wallet2
    //     );

    //     const depositToken2 = await Wallet.connect(wallet2).depositToken(
    //         aDAI.address,
    //         amountaDAIInDecimals,
    //         18
    //     );

    //     bal = await Wallet.balanceOf(aDAI.address, wallet1.address);
    //     expect(bal.toString()).to.be.equal((50 * 10 ** 18).toString());

    //     const sellOrderId = await Exchange.s_orderId();
    //     const sellOrder = await Exchange.connect(wallet2).createLimitSellOrder(
    //         ethAdd,
    //         amountAInDecimals,
    //         dai.address,
    //         amountBInDecimals,
    //         rateInDecimals,
    //         true
    //     );

    //     locked = await Wallet.getlockedFunds(wallet2.address, ethAdd);
    //     expect(locked.toString()).to.be.equal(amountAInDecimals.toString());

    //     //Match Order
    //     await expect(
    //         matchSellOrders(
    //             ethAdd,
    //             dai.address,
    //             sellOrderId.toString(),
    //             Exchange,
    //             FillLogic
    //         )
    //     ).to.not.be.rejected;

    //     const tradingFeeOrder = await tradingFee.calculateFees(
    //         amountAInDecimals,
    //         rateInDecimals,
    //         dai.address
    //     );

    //     const amountADAIToDeduct = await tradingFee.amountaDAIToDeduct(
    //         tradingFeeOrder
    //     );

    //     const buyerBalanceA = await Wallet.balanceOf(ethAdd, wallet1.address);
    //     const buyerBalanceB = await Wallet.balanceOf(
    //         dai.address,
    //         wallet1.address
    //     );
    //     const buyerBalanceADAI = await Wallet.balanceOf(
    //         adaiAdd,
    //         wallet1.address
    //     );

    //     const sellerBalanceA = await Wallet.balanceOf(ethAdd, wallet2.address);
    //     const sellerBalanceB = await Wallet.balanceOf(
    //         dai.address,
    //         wallet2.address
    //     );
    //     const sellerBalanceADAI = await Wallet.balanceOf(
    //         adaiAdd,
    //         wallet2.address
    //     );

    //     // //Buyer Balance
    //     expect(buyerBalanceA.toString()).to.be.equal(
    //         amountAInDecimals.toString()
    //     );
    //     expect(buyerBalanceB.toString()).to.be.equal("0");
    //     expect(buyerBalanceADAI.toString()).to.be.equal(
    //         (amountaDAIInDecimals - amountADAIToDeduct).toString()
    //     );

    //     // //Seller Balance
    //     expect(sellerBalanceA.toString()).to.be.equal("0");
    //     expect(sellerBalanceB.toString()).to.be.equal(
    //         amountBInDecimals.toString()
    //     );
    //     expect(sellerBalanceADAI.toString()).to.be.equal(
    //         (amountaDAIInDecimals - amountADAIToDeduct).toString()
    //     );
    // });
});
