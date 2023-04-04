// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceChecker.sol";
import "./TradingFees.sol";
import "./Wallet.sol";

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

    //Token Address List available in DEX
    _tokenInfo[] public tokenList;

    //s_orderBook mappping: tokenA Address -> tokenB Address -> Side -> Order Array
    mapping(address => mapping(address => mapping(uint256 => _Order[])))
        public s_orderBook;

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

    _Order public orderStruct;

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
        uint256 feesPaid; //in terms of USD
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

    event filledOrder(
        uint256 id,
        Side side,
        address user,
        address tokenA,
        address tokenB,
        uint256 amountFilled,
        uint256 fillRate,
        uint256 originalRate,
        uint256 originalAmountA,
        uint256 originalAmountB,
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

        wallet.exchangeUpdateLockedFunds(msg.sender, _tokenB, _amountB, true);

        s_orderBook[_tokenA][_tokenB][uint256(Side.BUY)].push(
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
        wallet.exchangeUpdateLockedFunds(msg.sender, _tokenA, _amountA, true);

        s_orderBook[_tokenA][_tokenB][uint256(Side.SELL)].push(
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
        address _tokenA,
        address _tokenB
    )
        public
        validOrder(_id, side, _tokenA, _tokenB)
        validToken(_tokenA)
        validToken(_tokenB)
    {
        uint256 _side = uint256(side);
        _Order[] storage _order = s_orderBook[_tokenA][_tokenB][_side];
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
                wallet.exchangeUpdateLockedFunds(
                    msg.sender,
                    order.tokenB,
                    order.amountB,
                    false
                );
            } else if (side == Side.SELL) {
                wallet.exchangeUpdateLockedFunds(
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

        s_orderBook[_tokenA][_tokenB][_side] = _order;

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

    function updateFilledOrders(
        _filledOrder memory order,
        uint256 _side
    ) external {
        s_filledOrders[order.user][_side].push(order);

        emit filledOrder(
            order.id,
            order.side,
            order.user,
            order.tokenA,
            order.tokenB,
            order.amountFilled,
            order.fillRate,
            order.originalRate,
            order.originalAmountA,
            order.originalAmountB,
            order.feesWaived,
            order.feesPaid
        );
    }

    function updateOrder(
        _Order memory order,
        uint256 _amountA,
        uint256 _amountB,
        uint256 _index
    ) external validOrder(order.id, order.side, order.tokenA, order.tokenB) {
        uint256 a = s_orderBook[order.tokenA][order.tokenB][uint8(order.side)][
            _index
        ].amountA;
        uint256 b = s_orderBook[order.tokenA][order.tokenB][uint8(order.side)][
            _index
        ].amountB;
        s_orderBook[order.tokenA][order.tokenB][uint8(order.side)][_index]
            .amountA = _amountA;
        s_orderBook[order.tokenA][order.tokenB][uint8(order.side)][_index]
            .amountB = _amountB;

        require(
            s_orderBook[order.tokenA][order.tokenB][uint8(order.side)][_index]
                .amountA <
                a &&
                s_orderBook[order.tokenA][order.tokenB][uint8(order.side)][
                    _index
                ].amountB <
                b,
            "Order not updated properly"
        );
    }

    function setManual(bool _isManual) external {
        s_isManual = _isManual;
        require(s_isManual == _isManual, "Invalid s_isManual bool");
    }

    function getOrderLength(
        Side side,
        address _tokenA,
        address _tokenB
    ) public view returns (uint256) {
        return s_orderBook[_tokenA][_tokenB][uint256(side)].length;
    }

    function getOrder(
        address _tokenA,
        address _tokenB,
        uint256 index,
        Side side
    ) public view returns (_Order memory) {
        _Order memory order = s_orderBook[_tokenA][_tokenB][uint256(side)][
            index
        ];
        return (order);
    }

    function getFilledOrderLength(
        address _user,
        Side side
    ) public view returns (uint256) {
        return s_filledOrders[_user][uint256(side)].length;
    }

    function getFilledOrder(
        address _user,
        Side side,
        uint256 index
    ) public view returns (_filledOrder memory) {
        return s_filledOrders[_user][uint256(side)][index];
    }

    function getOrderFromArray(
        address _tokenA,
        address _tokenB,
        uint256 side,
        uint256 _id
    ) public view returns (_Order memory, uint256) {
        uint256 i = 0;
        for (i; i < s_orderBook[_tokenA][_tokenB][side].length; i++) {
            if (s_orderBook[_tokenA][_tokenB][side][i].id == _id) {
                return (s_orderBook[_tokenA][_tokenB][side][i], i);
            }
        }
        revert("Order not Found");
    }

    function orderExists(
        uint256 _id,
        Side side,
        address _tokenA,
        address _tokenB
    ) public view returns (bool) {
        _Order[] memory orders = s_orderBook[_tokenA][_tokenB][uint256(side)];

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
        revert("Token not available");
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
        address _tokenA,
        address _tokenB
    ) {
        require(orderExists(_id, side, _tokenA, _tokenB), "Invalid Order ID");
        _;
    }

    modifier validToken(address _token) {
        require(isVerifiedToken(_token), "Token unavailable in DEX");
        _;
    }
}
