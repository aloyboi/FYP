// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceChecker is Ownable {
    _priceFeed[] public priceFeeds;

    struct _priceFeed {
        string name;
        address token;
        AggregatorV3Interface priceFeed;
    }

    //only using PriceFeeds pegged to USD
    function addPriceFeed(
        string memory _name,
        address _token,
        address _address
    ) external onlyOwner {
        _priceFeed[] memory pricefeed = priceFeeds;
        bool isAdded = false;
        for (uint256 i = 0; i < pricefeed.length; i++) {
            if (
                keccak256(abi.encodePacked(_name)) ==
                keccak256(abi.encodePacked(pricefeed[i].name))
            ) {
                isAdded = true;
                break;
            }
        }
        require(!isAdded, "Price Feed already added");
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_address);
        priceFeeds.push(_priceFeed(_name, _token, priceFeed));
    }

    function getPriceFeed(
        address _token
    ) internal view returns (AggregatorV3Interface priceFeed) {
        _priceFeed[] memory pricefeed = priceFeeds;

        for (uint256 i = 0; i < pricefeed.length; i++) {
            if (_token == pricefeed[i].token) {
                return pricefeed[i].priceFeed;
            }
        }
    }

    function getPrice(address _address) external view returns (uint256) {
        AggregatorV3Interface priceFeed = getPriceFeed(_address);
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer);
    }
}
