const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const Wallet = require("../artifacts/contracts/Wallet.sol/Wallet.json");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const ABI = require("../TokenABIS/tokenABI.json");

const testwallet1 = process.env.TEST_WALLET_1;
const testwallet2 = process.env.TEST_WALLET_2;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

describe("Wallet", async () => {
    let walletContract;
    let ethADD;
    let wallet;
    let wallet1, wallet2;
    let dai;
    let walletAdd;
    beforeEach(async () => {
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

        walletAdd = "0xc1ee82417b4374d04451b67ce26a2cbe9647505e";
        walletContract = new ethers.Contract(walletAdd, Wallet.abi, wallet1);

        ethADD = "0x0000000000000000000000000000000000000000";

        //DAI token
        daiAdd = "0xBa8DCeD3512925e52FE67b1b5329187589072A55";
        dai = new ethers.Contract(
            daiAdd,
            ABI.daiABI,
            ethers.provider.getSigner()
        );
    });

    describe("Verify Transactions", async () => {
        it("Deposit & Withdraw correct amount of ETH", async () => {
            const value = ethers.utils.parseEther("1.24").toString();

            const depositETH = await walletContract.depositETH({
                value: value,
            });
            await depositETH.wait();
            const amount = await walletContract.s_tokens(
                ethADD,
                wallet1.address,
                {
                    gasLimit: 250000,
                }
            );

            assert(amount, value);

            const amountWithdraw = ethers.utils
                .parseEther("0.01211")
                .toString();
            const withdrawETH = await walletContract.withdrawETH(
                amountWithdraw
            );
            await withdrawETH.wait();
            const remainingAmount = await walletContract.s_tokens(
                ethADD,
                wallet1.address
            );

            expect(remainingAmount.toString()).to.be.equal(
                (value - amountWithdraw).toString()
            );
        });
        it("Deposit & Withdraw correct amount of ERC20 tokens", async () => {
            const value = ethers.utils.parseEther("10").toString();
            const approve = await dai
                .connect(wallet1)
                .approve(walletContract.address, value, {
                    gasLimit: 250000,
                });
            await approve.wait(1);

            const checkBal = await dai.balanceOf(wallet1.address);

            const checkAllowance = await dai.allowance(
                wallet1.address,
                walletContract.address
            );
            //     await approve.wait(1);
            const depositDAI = await walletContract.depositToken(
                daiAdd,
                value,
                "18",
                {
                    gasLimit: 250000,
                }
            );
            await depositDAI.wait(1);
            const daiBalance = await walletContract.s_tokens(
                dai.address,
                wallet1.address
            );
            expect(daiBalance.toString()).to.be.equal(value);

            const withdrawValue = ethers.utils.parseEther("5.45345").toString();
            const withdrawDAI = await walletContract.withdrawToken(
                daiAdd,
                withdrawValue,
                "18"
            );
            await withdrawDAI.wait(1);

            const newBalance = await walletContract.s_tokens(
                dai.address,
                wallet1.address
            );
            expect(newBalance.toString()).to.be.equal(
                (daiBalance - withdrawValue).toString()
            );
        });
    });
});
