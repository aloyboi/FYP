import { ethers } from "ethers";
import Wallet from "../artifacts/contracts/Wallet.sol/Wallet.json";
import Exchange from "../artifacts/contracts/Exchange.sol/Exchange.json";
import PriceChecker from "../artifacts/contracts/PriceChecker.sol/PriceChecker.json";
import TradingFees from "../artifacts/contracts/TradingFees.sol/TradingFees.json";
import IERC20 from "../artifacts/contracts/interface/IERC20.sol/IERC20.json";

const walletAddress = process.env.REACT_APP_WALLET_ADDRESS;
const exchangeAddress = process.env.REACT_APP_EXCHANGE_ADDRESS;
const priceCheckerAddress = process.env.REACT_APP_PRICECHECKER_ADDRESS;
const decimals = 18;

export async function depositETH(_amount, callback, errorCallback) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(walletAddress, Wallet.abi, signer);
    try {
        const transaction = await contract.depositETH({
            value: ethers.utils.parseEther(_amount),
        });
        await transaction.wait();
        if (typeof callback == "function") {
            callback();
        }
    } catch (error) {
        console.log(error);
        if (typeof errorCallback == "function") {
            if (error.message.includes("INSUFFICIENT_FUNDS")) {
                errorCallback("Insufficient Funds");
            }
            if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            }
        }
    }
}

export async function getBalance(_tokenAddress, callback) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(walletAddress, Wallet.abi, signer);
    let userAdd;
    try {
        userAdd = await signer.getAddress();
        const transactionResponse = await contract.balanceOf(
            _tokenAddress,
            userAdd //have to change
        );

        const lockedFunds = await contract.lockedFunds(userAdd, _tokenAddress);
        let balance = transactionResponse / 10 ** decimals;
        let locked = lockedFunds / 10 ** decimals;

        if (typeof callback == "function") {
            callback(balance, locked);
        }
        return [balance, locked];
    } catch (error) {
        console.log(error);
    }
}

export async function withdrawETH(_amount, callback, errorCallback) {
    //let amount;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(walletAddress, Wallet.abi, signer);
    try {
        //amount = _amount; //variable amount
        const transaction = await contract.withdrawETH(
            ethers.utils.parseEther(_amount)
        );
        await transaction.wait();
        if (typeof callback == "function") {
            callback();
        }
    } catch (error) {
        console.log(error);
        if (typeof errorCallback == "function") {
            if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            }
        }
    }
}

async function approveERC20(_tokenAddress, spenderAddress, amount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const erc20Token = await new ethers.Contract(
        _tokenAddress,
        IERC20.abi,
        signer
    );

    const transaction = await erc20Token.approve(spenderAddress, amount);
    await transaction.wait(1);
    console.log("Approved!");
}

//Javascript level input enters as either 6/18 dp
export async function depositToken(
    _tokenAddress,
    _amount,
    _decimals,
    callback,
    errorCallback,
    tokenApproveCallback
) {
    //let amount;
    //let amountInDecimals;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const wallet = new ethers.Contract(walletAddress, Wallet.abi, signer);
    //amount = _amount;

    // if (_tokenAddress === USDCAddress) {
    let amountInDecimals = ethers.utils.parseUnits(_amount, _decimals);
    // } else amountInDecimals = ethers.utils.parseUnits(_amount, decimals);

    try {
        await approveERC20(_tokenAddress, wallet.address, amountInDecimals);
        if (typeof tokenApproveCallback == "function") {
            tokenApproveCallback();
        }
        const transaction = await wallet.depositToken(
            _tokenAddress,
            amountInDecimals,
            _decimals
        );
        await transaction.wait();
        if (typeof callback == "function") {
            callback();
        }
    } catch (error) {
        console.log(error);
        if (typeof errorCallback == "function") {
            if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            }
        }
    }
}

export async function withdrawToken(
    _tokenAddress,
    _amount,
    _decimals,
    callback,
    errorCallback
) {
    //let amount;
    //let amountInDecimals;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wallet = new ethers.Contract(walletAddress, Wallet.abi, signer);
    //amount = _amount;
    let amountInDecimals = ethers.utils.parseUnits(_amount, _decimals);

    try {
        const transaction = await wallet.withdrawToken(
            _tokenAddress,
            amountInDecimals,
            _decimals
        );
        await transaction.wait();
        if (typeof callback == "function") {
            callback();
        }
    } catch (error) {
        console.log(error);
        if (typeof errorCallback == "function") {
            if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            }
        }
    }
}

//Direct from input as decimal values
export async function createLimitBuyOrder(
    _tokenA,
    _amountA,
    _tokenB,
    _amountB,
    _rate,
    waiveFees,
    callbackOrderCreated,
    callbackOrderFilled,
    errorCallback
) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);

    try {
        const orderId = await exchange.s_orderId();
        const transaction = await exchange.createLimitBuyOrder(
            _tokenA,
            _amountA,
            _tokenB,
            _amountB,
            _rate,
            waiveFees
        );
        await transaction.wait();
        if (typeof callbackOrderCreated == "function") {
            callbackOrderCreated(
                `Order placed, order id:${orderId.toString()}`
            );
        }
        const fillOrder = await exchange.matchOrders(_tokenA, orderId, "0");
        await fillOrder.wait();
        if (typeof callbackOrderFilled == "function") {
            callbackOrderFilled("We will attempt to fill your order");
        }
    } catch (error) {
        if (typeof errorCallback == "function") {
            if (error.message.includes("Insufficient USDC")) {
                errorCallback("Insufficient USDC");
            } else if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            } else {
                errorCallback("An Error Occured");
            }
        }
    }
}

export async function createLimitSellOrder(
    _tokenA,
    _amountA,
    _tokenB,
    _amountB,
    _rate,
    waiveFees,
    callbackOrderCreated,
    callbackOrderFilled,
    errorCallback
) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);

    try {
        const orderId = await exchange.s_orderId();
        const transaction = await exchange.createLimitSellOrder(
            _tokenA,
            _amountA,
            _tokenB,
            _amountB,
            _rate,
            waiveFees
        );
        await transaction.wait();
        if (typeof callbackOrderCreated == "function") {
            callbackOrderCreated(
                `Order placed, order id:${orderId.toString()}`
            );
        }
        const fillOrder = await exchange.matchOrders(_tokenA, orderId, "1");
        await fillOrder.wait();
        if (typeof callbackOrderFilled == "function") {
            callbackOrderFilled("We will attempt to fill your order");
        }
    } catch (error) {
        if (typeof errorCallback == "function") {
            if (error.message.includes("Insufficient tokens")) {
                errorCallback("Insufficient tokens");
            } else if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            } else {
                errorCallback("An Error Occured");
            }
        }
    }
}

export async function getUserOrdersByTypeAndToken(
    _tokenAddress,
    _side,
    callback
) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);
    let userOrder;
    let orders = [];
    let userAdd = await signer.getAddress();
    try {
        let length = await exchange.getOrderLength(_side, _tokenAddress);
        for (let i = 0; i < length; i++) {
            userOrder = await exchange.getOrder(_tokenAddress, i, _side);
            if (userOrder[2] === userAdd) {
                let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
                let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB

                userOrder[0] = userOrder[0].toString();
                userOrder[1] = userOrder[1].toString();
                userOrder[4] = userOrder[4] / 10 ** (decimals - decimalValA);
                userOrder[6] = userOrder[6] / 10 ** (decimals - decimalValB);
                userOrder[7] = userOrder[7] / 10 ** decimals;
                userOrder[8] = userOrder[8] / 10 ** (decimals - decimalValA);
                userOrder[9] = userOrder[9] / 10 ** (decimals - decimalValB);

                orders.push(userOrder);
            }
        }
        if (typeof callback == "function") {
            callback(orders);
        }
    } catch (error) {
        console.log(error);
    }
}

export async function getAllUserOrders(_tokenAddresses, callback) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);
    let userOrder;
    let buyOrders = [];
    let filledOrders = [];
    let sellOrders = [];

    let length;
    let userAdd = await signer.getAddress();
    try {
        // get buy
        for (let j = 0; j < _tokenAddresses.length; j++) {
            length = await exchange.getOrderLength("0", _tokenAddresses[j]);

            for (let i = 0; i < length; i++) {
                userOrder = await exchange.getOrder(_tokenAddresses[j], i, "0");

                let modifiedBuyOrder = [];
                // copy userOrder array to modifiedOrder so that we can modify it using spread operator
                modifiedBuyOrder = [...userOrder];

                if (userOrder[2] === userAdd) {
                    let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
                    let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB

                    modifiedBuyOrder[0] = modifiedBuyOrder[0].toString();
                    modifiedBuyOrder[1] = modifiedBuyOrder[1].toString();
                    modifiedBuyOrder[4] =
                        modifiedBuyOrder[4] / 10 ** (decimals - decimalValA);
                    modifiedBuyOrder[6] =
                        modifiedBuyOrder[6] / 10 ** (decimals - decimalValB);
                    modifiedBuyOrder[7] = modifiedBuyOrder[7] / 10 ** decimals;
                    modifiedBuyOrder[8] =
                        modifiedBuyOrder[8] / 10 ** (decimals - decimalValA);
                    modifiedBuyOrder[9] =
                        modifiedBuyOrder[9] / 10 ** (decimals - decimalValB);

                    buyOrders.push(modifiedBuyOrder);
                }
            }
        }

        for (let j = 0; j < _tokenAddresses.length; j++) {
            let sellLength = await exchange.getOrderLength(
                "1",
                _tokenAddresses[j]
            );

            for (let i = 0; i < sellLength; i++) {
                let userSellOrder = await exchange.getOrder(
                    _tokenAddresses[j],
                    i,
                    "1"
                );

                // copy userOrder array to modifiedOrder so that we can modify it using spread operator
                let modifiedSellOrder = [];
                modifiedSellOrder = [...userSellOrder];

                if (userSellOrder[2] === userAdd) {
                    let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
                    let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB

                    modifiedSellOrder[0] = modifiedSellOrder[0].toString();
                    modifiedSellOrder[1] = modifiedSellOrder[1].toString();
                    modifiedSellOrder[4] =
                        modifiedSellOrder[4] / 10 ** (decimals - decimalValA);
                    modifiedSellOrder[6] =
                        modifiedSellOrder[6] / 10 ** (decimals - decimalValB);
                    modifiedSellOrder[7] =
                        modifiedSellOrder[7] / 10 ** decimals;
                    modifiedSellOrder[8] =
                        modifiedSellOrder[8] / 10 ** (decimals - decimalValA);
                    modifiedSellOrder[9] =
                        modifiedSellOrder[9] / 10 ** (decimals - decimalValB);

                    sellOrders.push(modifiedSellOrder);
                }
            }
        }

        let filledBuyLength = await exchange.getFilledOrderLength(userAdd, "0");
        for (let i = 0; i < filledBuyLength; i++) {
            userOrder = await exchange.getFilledOrder(userAdd, "0", i);

            let modifiedFilledOrder = [];
            // copy userOrder array to modifiedOrder so that we can modify it using spread operator
            modifiedFilledOrder = [...userOrder];

            let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
            let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB

            modifiedFilledOrder[0] = modifiedFilledOrder[0].toString();
            modifiedFilledOrder[1] = modifiedFilledOrder[1].toString();
            modifiedFilledOrder[5] = modifiedFilledOrder[5] / 10 ** decimals;
            modifiedFilledOrder[6] = modifiedFilledOrder[6] / 10 ** decimals;
            modifiedFilledOrder[7] = modifiedFilledOrder[7] / 10 ** decimals;
            modifiedFilledOrder[8] =
                modifiedFilledOrder[8] / 10 ** (decimals - decimalValA);
            modifiedFilledOrder[9] =
                modifiedFilledOrder[9] / 10 ** (decimals - decimalValB);
            modifiedFilledOrder[11] = modifiedFilledOrder[11] / 10 ** decimals;

            filledOrders.push(modifiedFilledOrder);
        }

        let filledSellLength = await exchange.getFilledOrderLength(
            userAdd,
            "1"
        );
        for (let i = 0; i < filledSellLength; i++) {
            userOrder = await exchange.getFilledOrder(userAdd, "1", i);

            let modifiedFilledOrder = [];
            // copy userOrder array to modifiedOrder so that we can modify it using spread operator
            modifiedFilledOrder = [...userOrder];

            let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
            let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB

            modifiedFilledOrder[0] = modifiedFilledOrder[0].toString();
            modifiedFilledOrder[1] = modifiedFilledOrder[1].toString();
            modifiedFilledOrder[5] = modifiedFilledOrder[5] / 10 ** decimals;
            modifiedFilledOrder[6] = modifiedFilledOrder[6] / 10 ** decimals;
            modifiedFilledOrder[7] = modifiedFilledOrder[7] / 10 ** decimals;
            modifiedFilledOrder[8] =
                modifiedFilledOrder[8] / 10 ** (decimals - decimalValA);
            modifiedFilledOrder[9] =
                modifiedFilledOrder[9] / 10 ** (decimals - decimalValB);
            modifiedFilledOrder[11] = modifiedFilledOrder[11] / 10 ** decimals;

            filledOrders.push(modifiedFilledOrder);
        }

        console.log(buyOrders);
        console.log(sellOrders);
        console.log(filledOrders);
        if (typeof callback == "function") {
            callback(buyOrders, sellOrders, filledOrders);
        }
    } catch (error) {
        console.log(error);
    }
}

export async function cancelOrder(
    _tokenAddress,
    _orderId,
    _side,
    callback,
    errorCallback
) {
    let side;

    if (_side === "buy") {
        side = "0";
    } else {
        side = "1";
    }
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const exchange = new ethers.Contract(
            exchangeAddress,
            Exchange.abi,
            signer
        );
        const tx = await exchange.cancelOrder(side, _orderId, _tokenAddress, {
            gasLimit: 250000,
        });
        await tx.wait();
        if (typeof callback == "function") {
            callback();
        }
    } catch (error) {
        console.log(error);
        if (typeof errorCallback == "function") {
            if (error.message.includes("user rejected transaction")) {
                errorCallback("Transaction Rejected");
            } else {
                errorCallback("An Error Occured");
            }
        }
    }
}

export async function getOrderBookByToken(_tokenAddress, callback) {
    let buyOrders = [];
    let sellOrders = [];
    let length;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);

    try {
        length = await exchange.getOrderLength("0", _tokenAddress);
        let modifiedOrder = [];

        for (let i = 0; i < length; i++) {
            let order = await exchange.getOrder(_tokenAddress, i, "0");
            modifiedOrder = [...order];

            let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
            let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB
            modifiedOrder[0] = modifiedOrder[0].toString();
            modifiedOrder[1] = modifiedOrder[1].toString();
            modifiedOrder[4] =
                modifiedOrder[4] / 10 ** (decimals - decimalValA);
            modifiedOrder[6] =
                modifiedOrder[6] / 10 ** (decimals - decimalValB);
            modifiedOrder[7] = modifiedOrder[7] / 10 ** decimals;
            modifiedOrder[8] =
                modifiedOrder[8] / 10 ** (decimals - decimalValA);
            modifiedOrder[9] =
                modifiedOrder[9] / 10 ** (decimals - decimalValB);
            buyOrders.push(modifiedOrder);
        }

        length = await exchange.getOrderLength("1", _tokenAddress);

        for (let i = 0; i < length; i++) {
            let order = await exchange.getOrder(_tokenAddress, i, "1");
            modifiedOrder = [...order];

            let decimalValA = await exchange.getTokenInfo(userOrder[3]); //tokenA
            let decimalValB = await exchange.getTokenInfo(userOrder[5]); //tokenB
            modifiedOrder[0] = modifiedOrder[0].toString();
            modifiedOrder[1] = modifiedOrder[1].toString();
            modifiedOrder[4] =
                modifiedOrder[4] / 10 ** (decimals - decimalValA);
            modifiedOrder[6] =
                modifiedOrder[6] / 10 ** (decimals - decimalValB);
            modifiedOrder[7] = modifiedOrder[7] / 10 ** decimals;
            modifiedOrder[8] =
                modifiedOrder[8] / 10 ** (decimals - decimalValA);
            modifiedOrder[9] =
                modifiedOrder[9] / 10 ** (decimals - decimalValB);

            sellOrders.push(modifiedOrder);
        }

        if (typeof callback == "function") {
            callback(buyOrders, sellOrders);
        }
    } catch (error) {
        console.log(error);
    }
}

export const addToken = async (_tokenAddress, callback) => {
    //get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //get exchange contract
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);
    try {
        //add token to exchange
        const tx = await exchange.addToken(_tokenAddress);
        await tx.wait();
        if (typeof callback == "function") {
            callback();
        }
    } catch (error) {
        console.log(error);
    }
};

export const getTokenList = async (callback) => {
    //get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //get exchange contract
    const exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer);
    let tokenList = [];
    try {
        //get token list
        let tokens = exchange.tokenList();
        for (let i = 0; i < tokens.length; i++) {
            tokenList.append(tokens[i].add);
        }
    } catch (error) {
        console.log(error);
        callback(tokenList);
    }
};
