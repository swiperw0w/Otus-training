// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PermitToken is ERC20 {
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

    mapping(address => uint256) public nonces;

    constructor() ERC20("PermitToken", "PRM") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name())),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function permit(
        address owner,
        address spender,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp <= deadline, "Permit: expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                amount,
                nonces[owner],
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address recovered = ecrecover(digest, v, r, s);
        require(recovered == owner, "Invalid signature");
        require(recovered != address(0));

        nonces[owner]++;
        _approve(owner, spender, amount);
    }
}

/*
owner address 0x8605c4e90fa2fd77846bf434ff9d020fe370798a
spender address 0xe3fFa675602B971C7764D2e23c395c8413519E7d
signature: 0x08e41a02080956b3970206fd857b58b95836994583f6baaeb013cda44ff63a9376087c99bc03da108ca3b0b83248cca4162f5aad63118952bbbf99eedc6cdfaf1b
r: 0x08e41a02080956b3970206fd857b58b95836994583f6baaeb013cda44ff63a93
s: 0x76087c99bc03da108ca3b0b83248cca4162f5aad63118952bbbf99eedc6cdfaf
v: 27
*/