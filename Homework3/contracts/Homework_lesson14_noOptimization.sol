// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

contract myHomeWork { // Deploy Gas 195803
    uint256 public totalSum; // storage

    event SumAdded(uint256 added, uint256 newTotal);

    function addNumbers(uint[] calldata nums) external { // addNumbers Gas 53917
        uint256[] memory copyNums = nums; // memory
        uint256 tempSum = 0; // stack

        for (uint i = 0; i < copyNums.length; i++) {
            tempSum += copyNums[i]; // stack
        }
        totalSum += tempSum; // storage
        emit SumAdded(tempSum, totalSum);
    }

    function readStorage() public view returns(uint256) {
        return totalSum;
    }
}