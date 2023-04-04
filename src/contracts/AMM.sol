// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Exchange.sol"; // Import the old contract that contains the original function
import "./TradingFees.sol";
import "./Wallet.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AMM is Ownable {
    using SafeMath for uint256; //for prevention of integer overflow
    Exchange exchange;
    TradingFees tradingFees;
    Wallet wallet;
    uint256 decimals = 10 ** 18;

    event fillBuyOrder(
        Exchange._Order remainingOrder,
        uint256 amountBought,
        uint256 fillBuyRate,
        bool feesWaived,
        uint256 feesPaid
    );

    event fillSellOrder(
        Exchange._Order remainingOrder,
        uint256 amountSold,
        uint256 fillSellRate,
        bool feesWaived,
        uint256 feesPaid
    );

    constructor(address _Exchange, address _fees, address _Wallet) {
        exchange = Exchange(_Exchange); // Set the address of the Exchange contract
        tradingFees = TradingFees(_fees);
        wallet = Wallet(_Wallet);
    }

    function fillOrder(
        address _tokenA,
        address _tokenB,
        uint256[][] memory _ordersToFill
    ) external {
        // Copy the function code from the old contract and replace any references to state variables with "oldContract.stateVariableName"
        Exchange._Order memory order;
        uint256 index;

        for (uint256 i = 0; i < _ordersToFill.length; i++) {
            require(
                _ordersToFill[i][2] != 0 && _ordersToFill[i][3] != 0,
                "Order values error"
            );
            (order, index) = exchange.getOrderFromArray(
                _tokenA,
                _tokenB,
                _ordersToFill[i][1],
                _ordersToFill[i][0]
            );

            require(
                order.amountA != 0 && order.amountB != 0,
                "Invalid Order Amount"
            );

            exchange.updateOrder(
                order,
                order.amountA.sub(_ordersToFill[i][2]),
                order.amountB.sub(
                    order.rate.mul(_ordersToFill[i][2]).div(decimals)
                ),
                index
            );

            order.amountA = order.amountA.sub(_ordersToFill[i][2]);

            uint256 fees = tradingFees.calculateFees(
                _ordersToFill[i][2],
                _ordersToFill[i][3],
                order.tokenB
            );
            require(fees != 0, "Fees cannot be 0");

            bool feesWaived = order.waiveFees &&
                tradingFees.checkSufficientaDAI(fees, order.user);

            if (_ordersToFill[i][1] == 0) {
                fillBuyOrders(
                    order,
                    _ordersToFill[i][2],
                    _ordersToFill[i][3],
                    feesWaived,
                    fees
                );
                emit fillBuyOrder(
                    order,
                    _ordersToFill[i][2],
                    _ordersToFill[i][3],
                    feesWaived,
                    fees
                );
            } else {
                fillSellOrders(
                    order,
                    _ordersToFill[i][2],
                    _ordersToFill[i][3],
                    feesWaived,
                    fees
                );
                emit fillSellOrder(
                    order,
                    _ordersToFill[i][2],
                    _ordersToFill[i][3],
                    feesWaived,
                    fees
                );
            }

            if (order.amountA == 0) {
                exchange.setManual(false);
                exchange.cancelOrder(
                    (
                        _ordersToFill[i][1] == 0
                            ? Exchange.Side.BUY
                            : Exchange.Side.SELL
                    ),
                    order.id,
                    order.tokenA,
                    order.tokenB
                );
                exchange.setManual(true);
            }
        }
    }

    function fillBuyOrders(
        Exchange._Order memory order,
        uint256 _amount,
        uint256 _rate,
        bool feesWaived,
        uint256 fees
    ) internal {
        if (feesWaived) {
            //Deduct aDAI
            uint256 aDAIToDeduct = tradingFees.amountaDAIToDeduct(fees);
            wallet.exchangeUpdateBalance(
                tradingFees.aDAI(),
                order.user,
                aDAIToDeduct,
                false
            );
            wallet.exchangeUpdateBalance(
                tradingFees.aDAI(),
                wallet.fundWallet(),
                aDAIToDeduct,
                true
            );

            //Credit Bought tokens
            wallet.exchangeUpdateBalance(
                order.tokenA,
                order.user,
                _amount,
                true
            );
        } else {
            uint256 amountTokenToDeduct = tradingFees.amountTokensToDeduct(
                order.tokenA,
                fees
            );
            //Credit Bought tokens after minusing fees
            wallet.exchangeUpdateBalance(
                order.tokenA,
                order.user,
                _amount.sub(amountTokenToDeduct),
                true
            );

            wallet.exchangeUpdateBalance(
                order.tokenA,
                wallet.fundWallet(),
                amountTokenToDeduct,
                true
            );
        }

        //Original Locked Funds unlocked
        wallet.exchangeUpdateLockedFunds(
            order.user,
            order.tokenB,
            (order.rate.mul(_amount)).div(decimals),
            false
        );

        //buyer update
        //Buyer balance deducted from what he paid
        wallet.exchangeUpdateBalance(
            order.tokenB,
            order.user,
            (_rate.mul(_amount)).div(decimals),
            false
        );

        exchange.updateFilledOrders(
            Exchange._filledOrder(
                order.id,
                Exchange.Side.BUY,
                order.user,
                order.tokenA,
                order.tokenB,
                _amount,
                _rate,
                order.rate,
                order.originalAmountA,
                order.originalAmountB,
                feesWaived,
                fees
            ),
            uint256(Exchange.Side.BUY)
        );
    }

    function fillSellOrders(
        Exchange._Order memory order,
        uint256 _amount,
        uint256 _rate,
        bool feesWaived,
        uint256 fees
    ) internal {
        if (feesWaived) {
            //Deduct aDAI
            uint256 aDAIToDeduct = tradingFees.amountaDAIToDeduct(fees);
            wallet.exchangeUpdateBalance(
                tradingFees.aDAI(),
                order.user,
                aDAIToDeduct,
                false
            );
            wallet.exchangeUpdateBalance(
                tradingFees.aDAI(),
                wallet.fundWallet(),
                aDAIToDeduct,
                true
            );

            //Credit Earned tokens
            wallet.exchangeUpdateBalance(
                order.tokenB,
                order.user,
                (_rate.mul(_amount)).div(decimals),
                true
            );
        } else {
            uint256 amountTokensToDeduct = tradingFees.amountTokensToDeduct(
                order.tokenB,
                fees
            );
            wallet.exchangeUpdateBalance(
                order.tokenA,
                wallet.fundWallet(),
                amountTokensToDeduct,
                true
            );
            //Credit Earned tokens after minusing fees
            wallet.exchangeUpdateBalance(
                order.tokenB,
                order.user,
                (_rate.mul(_amount)).div(decimals).sub(amountTokensToDeduct),
                true
            );
        }

        wallet.exchangeUpdateLockedFunds(
            order.user,
            order.tokenA,
            _amount,
            false
        );
        //seller update
        wallet.exchangeUpdateBalance(order.tokenA, order.user, _amount, false);

        exchange.updateFilledOrders(
            Exchange._filledOrder(
                order.id,
                Exchange.Side.SELL,
                order.user,
                order.tokenA,
                order.tokenB,
                _amount,
                _rate,
                order.rate,
                order.originalAmountA,
                order.originalAmountB,
                feesWaived,
                fees
            ),
            uint256(Exchange.Side.SELL)
        );
    }

    function setWalletAddress(address _Walletaddress) public onlyOwner {
        wallet = Wallet(_Walletaddress);
    }

    function setExchangeAddress(address _exchange) public onlyOwner {
        exchange = Exchange(_exchange);
    }

    function setTradingFeesAddress(address _fees) public onlyOwner {
        tradingFees = TradingFees(_fees);
    }
}
