// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceChecker.sol";
import "./TradingFees.sol";

/// @notice Library SafeMath used to prevent overflows and underflows
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Exchange is Ownable {
    using SafeMath for uint256; //for prevention of integer overflow
    PriceChecker priceChecker;
    TradingFees tradingFees;
    Wallet wallet;

    uint256 decimals = 10 ** 18;
    address public ethToken = address(0);
    address public aETH = address(0x22404B0e2a7067068AcdaDd8f9D586F834cCe2c5);

    //Token Address List available in DEX
    _tokenInfo[] public tokenList;

    //s_orderBook mappping: tokenAddress -> Side -> Order Array
    mapping(address => mapping(uint256 => _Order[])) public s_orderBook;

    mapping(address => mapping(uint256 => _filledOrder[]))
        public s_filledOrders;

    uint256 public s_orderId = 0;
    bool private s_isManual = true;

    struct _tokenInfo {
        address add;
        uint256 decimals;
    }

    struct _fillOrderValues {
        uint256 rate;
        uint256 amount;
    }

    //Structs representing an order that has unique id, user and amounts to give and get between two tokens to exchange
    struct _Order {
        uint256 id;
        Side side;
        address user;
        address tokenA;
        uint256 amountA;
        address tokenB;
        uint256 amountB;
        uint256 rate; // TokenB/TokenA = price in terms of TokenB
        uint256 originalAmountA;
        uint256 originalAmountB;
        bool waiveFees;
    }

    //For any order that is filled even if it is partially filled or fully filled
    struct _filledOrder {
        uint256 id;
        Side side;
        address user;
        address tokenA;
        address tokenB;
        uint256 amountFilled;
        uint256 fillRate;
        uint256 originalRate;
        uint256 originalAmountA;
        uint256 originalAmountB;
        bool feesWaived;
        uint256 feesPaid; //in terms of ETH
    }

    enum Side {
        BUY,
        SELL
    }

    //add events
    /// @notice Event when an order is placed on an exchange
    event Order(
        uint256 id,
        Side side,
        address user,
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        uint256 rate,
        uint256 originalAmountA,
        uint256 originalAmountB,
        bool waiveFees
    );

    /// @notice Event when an order is cancelled
    event Cancel(
        uint256 id,
        Side side,
        address user,
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB,
        uint256 rate,
        uint256 originalAmountA,
        uint256 originalAmountB,
        bool waiveFees
    );

    event fillBuyOrder(
        _Order remainingOrder,
        uint256 amountBought,
        uint256 fillBuyRate,
        bool feesWaived,
        uint256 feesPaid
    );

    event fillSellOrder(
        _Order remainingOrder,
        uint256 amountSold,
        uint256 fillSellRate,
        bool feesWaived,
        uint256 feesPaid
    );

    constructor(address _wallet, address _fees, address _priceChecker) {
        wallet = Wallet(_wallet);
        tradingFees = TradingFees(_fees);
        priceChecker = PriceChecker(_priceChecker);
    }

    function createLimitBuyOrder(
        // TokenA/TokenB
        address _tokenA,
        uint256 _amountA,
        address _tokenB,
        uint256 _amountB,
        uint256 _rate,
        bool _waiveFees
    ) external validToken(_tokenA) validToken(_tokenB) {
        //Amount user has deposited in the DEX must be >= value he wants to buy
        require(
            wallet.balanceOf(_tokenB, msg.sender).sub(
                wallet.getlockedFunds(msg.sender, _tokenB)
            ) >= _amountB,
            "Insufficient Funds"
        );

        wallet.updateLockedFunds(msg.sender, _tokenB, _amountB, true);

        s_orderBook[_tokenA][uint256(Side.BUY)].push(
            _Order(
                s_orderId,
                Side.BUY,
                msg.sender,
                _tokenA,
                _amountA,
                _tokenB,
                _amountB,
                _rate,
                _amountA,
                _amountB,
                _waiveFees
            )
        );

        emit Order(
            s_orderId,
            Side.BUY,
            msg.sender,
            _tokenA,
            _amountA,
            _tokenB,
            _amountB,
            _rate,
            _amountA,
            _amountB,
            _waiveFees
        );

        s_orderId = s_orderId.add(1);
    }

    function createLimitSellOrder(
        address _tokenA,
        uint256 _amountA,
        address _tokenB,
        uint256 _amountB,
        uint256 _rate,
        bool _waiveFees
    ) external validToken(_tokenA) validToken(_tokenB) {
        //Amount of tokens user deposit in DEX must be >= the amount of tokens they want to sell
        require(
            wallet.balanceOf(_tokenA, msg.sender).sub(
                wallet.getlockedFunds(msg.sender, _tokenA)
            ) >= _amountA,
            "Insufficient Funds"
        );

        //Lock the funds (tokens) in the wallet
        wallet.updateLockedFunds(msg.sender, _tokenA, _amountA, true);

        s_orderBook[_tokenA][uint256(Side.SELL)].push(
            _Order(
                s_orderId,
                Side.SELL,
                msg.sender,
                _tokenA,
                _amountA,
                _tokenB,
                _amountB,
                _rate,
                _amountA,
                _amountB,
                _waiveFees
            )
        );

        emit Order(
            s_orderId,
            Side.SELL,
            msg.sender,
            _tokenA,
            _amountA,
            _tokenB,
            _amountB,
            _rate,
            _amountA,
            _amountB,
            _waiveFees
        );

        s_orderId = s_orderId.add(1);
    }

    function cancelOrder(
        Side side,
        uint256 _id,
        address _token
    ) public validOrder(_id, side, _token) validToken(_token) {
        _Order[] storage _order = s_orderBook[_token][uint256(side)];
        uint256 size = _order.length;
        _Order memory order;

        uint256 index;
        for (uint256 i = 0; i < size; i++) {
            if (_order[i].id == _id) {
                index = i;
                order = _order[i];
                break;
            }
        }

        //Manual cancellation of orders
        if (s_isManual) {
            require(msg.sender == order.user, "Not Owner");

            //Unlock funds
            if (side == Side.BUY) {
                wallet.updateLockedFunds(
                    msg.sender,
                    order.tokenB,
                    order.amountB,
                    false
                );
            } else if (side == Side.SELL) {
                wallet.updateLockedFunds(
                    msg.sender,
                    order.tokenA,
                    order.amountA,
                    false
                );
            }
        }

        for (uint256 j = index; j < size - 1; j++) {
            _order[j] = _order[j.add(1)];
        }
        delete _order[size.sub(1)];
        _order.pop();

        s_orderBook[_token][uint256(side)] = _order;

        emit Cancel(
            _id,
            order.side,
            order.user,
            order.tokenA,
            order.amountA,
            order.tokenB,
            order.amountB,
            order.rate,
            order.originalAmountA,
            order.originalAmountB,
            order.waiveFees
        );
    }

    function fillOrder(
        Side side,
        uint256 _id,
        address _token,
        _fillOrderValues memory a
    ) internal validOrder(_id, side, _token) validToken(_token) {
        uint256 _side = uint256(side);
        (_Order memory order, uint256 index) = getOrderFromArray(
            _token,
            _side,
            _id
        );

        require(order.amountA >= a.amount, "Invalid Order Amount to fill");

        order.amountA = order.amountA.sub(a.amount);
        order.amountB = order.amountB.sub(
            order.rate.mul(a.amount).div(decimals)
        );
        s_orderBook[_token][_side][index].amountA = order.amountA;
        s_orderBook[_token][_side][index].amountB = order.amountB;

        uint256 fees = tradingFees.calculateFees(
            a.amount,
            a.rate,
            order.tokenB
        ); //fees in terms of USD value 18dp
        bool feesWaived = order.waiveFees &&
            tradingFees.checkSufficientaDAI(fees, order.user);

        if (side == Side.BUY) {
            fillBuyOrders(order, a.amount, a.rate, feesWaived, fees);
            emit fillBuyOrder(order, a.amount, a.rate, feesWaived, fees);
        } else if (side == Side.SELL) {
            fillSellOrders(order, a.amount, a.rate, feesWaived, fees);
            emit fillSellOrder(order, a.amount, a.rate, feesWaived, fees);
        }

        if (order.amountA == 0) {
            s_isManual = false;
            cancelOrder(side, order.id, order.tokenA); //remove filled orders
            s_isManual = true;
        }
    }

    function fillBuyOrders(
        _Order memory order,
        uint256 _amount,
        uint256 _rate,
        bool feesWaived,
        uint256 fees
    ) internal {
        if (feesWaived) {
            //Deduct aDAI
            uint256 aDAIToDeduct = tradingFees.amountaDAIToDeduct(fees);
            wallet.updateBalance(
                tradingFees.aDAI(),
                order.user,
                aDAIToDeduct,
                false
            );
            //Credit Bought tokens
            wallet.updateBalance(order.tokenA, order.user, _amount, true);
        } else {
            uint256 amountTokenToDeduct = tradingFees.amountTokensToDeduct(
                order.tokenA,
                fees
            );
            //Credit Bought tokens after minusing fees
            wallet.updateBalance(
                order.tokenA,
                order.user,
                _amount.sub(amountTokenToDeduct),
                true
            );
        }

        //Original Locked Funds unlocked
        wallet.updateLockedFunds(
            order.user,
            order.tokenB,
            (order.rate.mul(_amount)).div(decimals),
            false
        );

        //buyer update
        //Buyer balance deducted from what he paid
        wallet.updateBalance(
            order.tokenB,
            order.user,
            (_rate.mul(_amount)).div(decimals),
            false
        );

        s_filledOrders[order.user][0].push(
            _filledOrder(
                order.id,
                order.side,
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
            )
        );
    }

    function fillSellOrders(
        _Order memory order,
        uint256 _amount,
        uint256 _rate,
        bool feesWaived,
        uint256 fees
    ) internal {
        if (feesWaived) {
            //Deduct aETH
            uint256 aDAIToDeduct = tradingFees.amountaDAIToDeduct(fees);
            wallet.updateBalance(aETH, order.user, aDAIToDeduct, false);
            //Credit Earned tokens
            wallet.updateBalance(
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
            //Credit Earned tokens after minusing fees
            wallet.updateBalance(
                order.tokenB,
                order.user,
                (_rate.mul(_amount)).div(decimals).sub(amountTokensToDeduct),
                true
            );
        }

        wallet.updateLockedFunds(order.user, order.tokenA, _amount, false);
        //seller update
        wallet.updateBalance(order.tokenA, order.user, _amount, false);
    }

    function matchOrders(
        address _token,
        uint256 _id,
        Side side
    ) internal validOrder(_id, side, _token) validToken(_token) {
        uint256 saleTokenAmt;

        if (side == Side.BUY) {
            //Retrieve sell order to match
            _Order[] memory _sellOrder = s_orderBook[_token][1];
            for (uint256 i = 0; i < _sellOrder.length; i++) {
                //Retrieve buy order to be filled
                (_Order memory buyOrderToFill, ) = getOrderFromArray(
                    _token,
                    uint8(side),
                    _id
                );
                //sell order hit buyer's limit price & tokenB matches
                if (
                    _sellOrder[i].rate <= buyOrderToFill.rate &&
                    buyOrderToFill.tokenB == _sellOrder[i].tokenB
                ) {
                    _Order memory sellOrder = _sellOrder[i];
                    //if buyer's amount to buy > seller's amount to sell
                    if (buyOrderToFill.amountA > sellOrder.amountA) {
                        saleTokenAmt = sellOrder.amountA;
                    }
                    //if seller's amount to sell >= buyer's amount to buy
                    else if (buyOrderToFill.amountA <= sellOrder.amountA) {
                        saleTokenAmt = buyOrderToFill.amountA;
                    }

                    //Verify current balance
                    require(
                        wallet.balanceOf(
                            buyOrderToFill.tokenB,
                            buyOrderToFill.user
                        ) >= (saleTokenAmt.mul(sellOrder.rate)).div(decimals),
                        "Insufficient Buyer Token Balance"
                    );
                    require(
                        wallet.balanceOf(_token, sellOrder.user) >=
                            saleTokenAmt,
                        "Insufficient Seller Token Balance"
                    );

                    //update orders
                    _fillOrderValues memory fillOrderValues = _fillOrderValues(
                        sellOrder.rate,
                        saleTokenAmt
                    );
                    fillOrder(Side.BUY, _id, _token, fillOrderValues);
                    fillOrder(Side.SELL, sellOrder.id, _token, fillOrderValues);
                }

                bool orderExist = orderExists(_id, side, _token);
                if (!orderExist) break;
            }
        } else if (side == Side.SELL) {
            //Retrieve buy order to match
            _Order[] memory _buyOrder = s_orderBook[_token][0];
            for (uint256 i = 0; i < _buyOrder.length; i++) {
                //Retrieve sell order to be filled
                (_Order memory sellOrderToFill, ) = getOrderFromArray(
                    _token,
                    1,
                    _id
                );
                //sell order hit buyer's limit price
                if (
                    _buyOrder[i].rate >= sellOrderToFill.rate &&
                    _buyOrder[i].tokenB == sellOrderToFill.tokenB
                ) {
                    _Order memory order = _buyOrder[i];

                    //if seller's amount to sell > buyer's amount to buy
                    if (sellOrderToFill.amountA > order.amountA) {
                        saleTokenAmt = order.amountA;
                    }
                    //if buyer's amount to buy > seller's amount to sell
                    else if (sellOrderToFill.amountA <= order.amountA) {
                        saleTokenAmt = sellOrderToFill.amountA;
                    }
                    //Verify current balance
                    require(
                        wallet.balanceOf(_token, sellOrderToFill.user) >=
                            saleTokenAmt,
                        "Insufficient Seller Token Balance"
                    );
                    require(
                        wallet.balanceOf(order.tokenB, order.user) >=
                            (saleTokenAmt.mul(order.rate)).div(decimals),
                        "Insufficient Buyer Token Balance"
                    );

                    //update orders
                    _fillOrderValues memory fillOrderValues = _fillOrderValues(
                        order.rate,
                        saleTokenAmt
                    );
                    fillOrder(Side.SELL, _id, _token, fillOrderValues);
                    fillOrder(Side.BUY, order.id, _token, fillOrderValues);
                }
                bool orderExist = orderExists(_id, side, _token);
                if (!orderExist) break;
            }
        }
    }

    function getOrderLength(
        Side side,
        address _token
    ) public view returns (uint256) {
        return s_orderBook[_token][uint256(side)].length;
    }

    // function getOrder(
    //     address _token,
    //     uint256 index,
    //     Side side
    // )
    //     public
    //     view
    //     returns (
    //         uint256, //id
    //         uint256, //Side
    //         address, //user
    //         address, //tokenA
    //         uint256, //amountA
    //         address, //tokenB
    //         uint256, //amountB
    //         uint256, //rate -> TokenB/TokenA
    //         uint256, //originalAmountA
    //         uint256, //originalAmountB
    //         bool //feesWaived enabled
    //     )
    // {
    //     _Order memory order = s_orderBook[_token][uint256(side)][index];
    //     return (
    //         order.id,
    //         uint256(order.side),
    //         order.user,
    //         order.tokenA,
    //         order.amountA,
    //         order.tokenB,
    //         order.amountB,
    //         order.rate,
    //         order.originalAmountA,
    //         order.originalAmountB,
    //         order.waiveFees
    //     );
    // }

    function getFilledOrderLength(
        address _user,
        Side side
    ) public view returns (uint256) {
        return s_filledOrders[_user][uint256(side)].length;
    }

    // function getFilledOrder(
    //     address _user,
    //     Side side,
    //     uint256 index
    // )
    //     public
    //     view
    //     returns (
    //         uint256, //id
    //         uint256, //side
    //         address, //user
    //         address, //tokenA
    //         address, //tokenB
    //         uint256, //amountFilled
    //         uint256, //fillRate
    //         uint256, //originalRate
    //         uint256, //originalAmountA
    //         uint256, //originalAmountB
    //         bool, //feesWaived
    //         uint256 //feesPaid
    //     )
    // {
    //     _filledOrder memory filledOrder = s_filledOrders[_user][uint256(side)][
    //         index
    //     ];
    //     return (
    //         filledOrder.id,
    //         uint256(filledOrder.side),
    //         filledOrder.user,
    //         filledOrder.tokenA,
    //         filledOrder.tokenB,
    //         filledOrder.amountFilled,
    //         filledOrder.fillRate,
    //         filledOrder.originalRate,
    //         filledOrder.originalAmountA,
    //         filledOrder.originalAmountB,
    //         filledOrder.feesWaived,
    //         filledOrder.feesPaid
    //     );
    // }

    function getOrderFromArray(
        address _token,
        uint256 side,
        uint256 _id
    ) public view returns (_Order memory, uint256) {
        uint256 i = 0;
        _Order[] memory _order = s_orderBook[_token][side];
        _Order memory order;
        for (i; i < _order.length; i++) {
            if (_order[i].id == _id) {
                order = _order[i];
                break;
            }
        }
        return (order, i);
    }

    function orderExists(
        uint256 _id,
        Side side,
        address _token
    ) public view returns (bool) {
        _Order[] memory orders = s_orderBook[_token][uint256(side)];

        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].id == _id) {
                return true;
            }
        }
        return false;
    }

    function addToken(address _token, uint256 _decimals) public onlyOwner {
        require(!isVerifiedToken(_token), "Token already verified");
        tokenList.push(_tokenInfo(_token, _decimals));
    }

    function isVerifiedToken(address _token) public view returns (bool) {
        //uint256 size = tokenList.length;

        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i].add == _token) return true;
        }
        return false;
    }

    function getTokenInfo(address _token) public view returns (uint256) {
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i].add == _token) {
                return tokenList[i].decimals;
            }
        }
    }

    function setWalletAddress(address _Walletaddress) public onlyOwner {
        wallet = Wallet(_Walletaddress);
    }

    function setPriceCheckerAddress(
        address _PriceCheckeraddress
    ) public onlyOwner {
        priceChecker = PriceChecker(_PriceCheckeraddress);
    }

    function setTradingFees(address _tradingFees) public onlyOwner {
        tradingFees = TradingFees(_tradingFees);
    }

    modifier validOrder(
        uint256 _id,
        Side side,
        address _token
    ) {
        require(orderExists(_id, side, _token), "Invalid Order ID");
        _;
    }

    modifier validToken(address _token) {
        require(isVerifiedToken(_token), "Token unavailable in DEX");
        _;
    }
}
