// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SwipTokenOtus is ERC20, Ownable {
    constructor(address recipient, address initialOwner)
        ERC20("SwipTokenOtus", "SWPR")
        Ownable(initialOwner)
    {
        _mint(recipient, 2 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
