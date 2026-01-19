// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract TokenFactory {

    address public implementation;
    address[] public tokens;

    event TokenCreated(address proxy, address owner);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createToken() external returns (address) {
        bytes memory data = abi.encodeWithSignature("initialize()");

        ERC1967Proxy proxy = new ERC1967Proxy(
            implementation,
            data
        );

        tokens.push(address(proxy));

        emit TokenCreated(address(proxy), msg.sender);
        return address(proxy);
    }

    function getTokens() external view returns (address[] memory) {
        return tokens;
    }
}
