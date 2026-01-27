// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract EthUsdOracle {
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() external view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function getDecimals() external view returns (uint8) {
        return priceFeed.decimals();
    }
}