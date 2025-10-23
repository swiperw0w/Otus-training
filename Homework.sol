// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

// Gas Deploy до оптимизации 195803
// Gas Deploy после оптимизации 178397

contract Homework {
    uint256 public totalSum; // storage

    event SumAdded(uint256 added, uint256 newTotal);

    function addNumbers(uint[] calldata nums) external {
        //Изначально делал лишнее копирование, для показания memory, но оно не нужно,
        //т.к работаем с calldata напрямую.
        // uint256[] memory copyNums = nums; // memory
        uint256 tempSum = 0; // stack

        //В цикле поменял copyNums на nums
        for (uint256 i = 0; i < nums.length; i++)  {
            // Поменял copyNums на nums
            tempSum += nums[i]; // stack
        }
        totalSum += tempSum; // storage
        emit SumAdded(tempSum, totalSum);
    }

    //По итогу лишняя функция, которая не нужна т.к есть totalSum.
    // function readStorage() public view returns(uint256) {
    //     return totalSum;
    // }
}