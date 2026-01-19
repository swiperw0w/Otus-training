// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./PermitTokenUUPS_V1.sol";

contract PermitTokenUUPS_V2 is PermitTokenUUPS_V1 {
    function version() external pure returns (string memory) {
        return "V2";
    }
}
