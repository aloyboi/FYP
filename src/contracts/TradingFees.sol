// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceChecker.sol";
import "./Wallet.sol";

/// @notice Library SafeMath used to prevent overflows and underflows
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradingFees is Ownable {
    //When trading, have an option toggle to waive trading fees or not using deposited aETH
    //Users have to first deposit aETH tokens into the Exchange contract to waive, aETH tokens are not for trading
    //When a trade order goes through, trading fees of the trade fulfilled  = trade amount x trade price x 0.01,
    //contract checks how much aETH is deposited and what is the value of aETH, if sufficient to waive fees fully, deduct balance in deposit
    //and waive trading fees

    using SafeMath for uint256; //for prevention of integer overflow

    uint256 decimals = 10 ** 18;
    address public daiToken =
        address(0xBa8DCeD3512925e52FE67b1b5329187589072A55); //based on Aave contract
    address public aDAI = address(0xADD98B0342e4094Ec32f3b67Ccfd3242C876ff7a); //based on Aave contract
    PriceChecker private priceFeed;
    Wallet wallet;

    constructor(address _priceCheckerAddress) {
        priceFeed = PriceChecker(_priceCheckerAddress);
    }

    function calculateFees(
        uint256 _amount,
        uint256 _rate,
        address _refToken
    ) public view returns (uint256) {
        //Calculated based on TokenB price, require actual price in 18dp
        //trading fees is 0.1% of trade = 0.001
        //moving up 18dp is 0.001 x 10**18 = 10**14
        //have to fetch tokenPrice from PriceFeed
        uint256 priceOfToken = priceFeed.getPrice(_refToken); //in 8dp originally
        uint256 value = (
            ((_amount.mul(_rate)).div(decimals)).mul(priceOfToken.mul(10 ** 10))
        ).div(decimals);
        uint256 fees = value.div(10 ** 4);

        return fees; //based on USD value
    }

    //Amount of DAI to deduct from fees
    function amountaDAIToDeduct(uint256 _fees) public view returns (uint256) {
        uint256 aDAI_Price = priceFeed.getPrice(daiToken); // in 8 decimals initially
        uint256 amt = _fees.mul(decimals).div(aDAI_Price.mul(10 ** 10));
        return uint256(amt);
    }

    //Amount of Tokens to deduct from fees
    function amountTokensToDeduct(
        address _refToken,
        uint256 _fees
    ) public view returns (uint256) {
        uint256 priceOfToken = priceFeed.getPrice(_refToken); //in 8decimals
        uint256 amt = _fees.mul(decimals).div(priceOfToken.mul(10 ** 10));
        return uint256(amt);
    }

    function checkSufficientaDAI(
        uint256 _fees,
        address _user
    ) public view returns (bool) {
        uint256 amtDAI = amountaDAIToDeduct(_fees);
        uint256 balance = wallet.s_tokens(aDAI, _user);

        return balance >= amtDAI;
    }

    function setWalletAddress(address _Walletaddress) public onlyOwner {
        wallet = Wallet(_Walletaddress);
    }

    function setPriceCheckerAddress(
        address _PriceCheckeraddress
    ) public onlyOwner {
        priceFeed = PriceChecker(_PriceCheckeraddress);
    }
}
