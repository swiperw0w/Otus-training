// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PermitTokenUUPS_V1 is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    function initialize() public initializer {
        __ERC20_init("PermitToken", "PRM");
        __Ownable_init(msg.sender);
        _mint(msg.sender, 1_000_000 ether);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

}
