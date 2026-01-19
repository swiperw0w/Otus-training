// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AdminControlled is Ownable, AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    bool public paused;

    event Paused(address indexed by);
    event Unpaused(address indexed by);


    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    function grantAdmin(address admin) public onlyOwner {
        require(admin != address(0), "Invalid admin address");
        _grantRole(ADMIN_ROLE, admin);

    }

    function revokeAdmin(address admin) public onlyOwner {
        require(admin != address(0), "Invalid admin address");
        _revokeRole(ADMIN_ROLE, admin);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        paused = false;
        emit Unpaused(msg.sender);
    }


}