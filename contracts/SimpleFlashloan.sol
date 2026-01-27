// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IERC20 } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IFlashLoanSimpleReceiver } from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import { IPoolAddressesProvider } from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract SimpleFlashloan is IFlashLoanSimpleReceiver {
    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;
    address public owner;

    event FlashLoanExecuted(address asset, uint256 amount, uint256 premium);
    event Deposited(address indexed token, uint256 amount);

    constructor(address provider) {
        ADDRESSES_PROVIDER = IPoolAddressesProvider(provider);
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
        owner = msg.sender;
    }

    function deposit(address token, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Deposited(token, amount);
    }

    function requestFlashloan(address asset, uint256 amount) external {
        require(msg.sender == owner, "Only owner");

        POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            "",
            0
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata 
    ) external returns (bool) {
        require(msg.sender == address(POOL), "Caller must be pool");
        require(initiator == address(this), "Initiator must be this contract");
        
        uint256 totalDebt = amount + premium;
        uint256 balance = IERC20(asset).balanceOf(address(this));
        
        require(balance >= amount + premium, "Not enough balance to repay");

        IERC20(asset).approve(address(POOL), totalDebt);

        emit FlashLoanExecuted(asset, amount, premium);
        
        return true;
    }
}
// Aave V3 PoolAdressesProvider 0x0496275d34753A48320CA58103d5220d394FF77F
