// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

interface IWormhole {
    struct VM {
        uint8 version;
        uint32 timestamp;
        uint32 nonce;
        uint16 emitterChainId;
        bytes32 emitterAddress;
        uint64 sequence;
        uint8 consistencyLevel;
        bytes payload;
        uint32 guardianSetIndex;
        bytes[] signatures;
        bytes32 hash;
    }

    function publishMessage(
        uint32 nonce,
        bytes memory payload,
        uint8 consistencyLevel
    ) external payable returns (uint64);

    function parseVM(bytes calldata encodedVM) external pure returns (VM memory);
}

contract SimpleWormholeTokenBridge {
    string public name = "BridgedToken";
    string public symbol = "BT";
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event TransferReceived(uint256 amount);

    uint256 public lastReceivedAmount;

    IWormhole public wormhole;
    address public owner;

    constructor(address _wormhole) {
        wormhole = IWormhole(_wormhole);
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) internal {
        require(balanceOf[from] >= amount, "not enough balance");
        balanceOf[from] -= amount;
        emit Transfer(from, address(0), amount);
    }

    // BNB => Polygon
    function send(uint256 amount) external payable {
        burn(msg.sender, amount);

        bytes memory payload = abi.encode(amount);
        wormhole.publishMessage{value: msg.value}(0, payload, 1);
    }

    // Polygon <= BNB (DEMO)
    function receiveMessage(bytes calldata payload) external {
    // payload = abi.encode(address, uint256)
    (address to, uint256 amount) = abi.decode(payload, (address, uint256));

    lastReceivedAmount = amount;
    emit TransferReceived(amount);
}

    function faucet(uint256 amount) external {
        mint(msg.sender, amount);
    }
}
