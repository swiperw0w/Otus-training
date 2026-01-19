// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MetaTx {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    mapping(address => uint256) public nonces;
    uint256 public value;

    event ValueSet(address indexed sender, uint256 value);

    function setValue(uint256 newValue) external {
        value = newValue;
        emit ValueSet(_msgSender(), newValue);
    }

    function getHash(
        address user,
        bytes calldata data
    ) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                user,
                data,
                nonces[user],
                address(this),
                block.chainid
            )
        );
    }

    function executeMetaTx(
        address user,
        bytes calldata data,
        bytes calldata signature
    ) external {
        bytes32 hash = getHash(user, data);
        address recovered =
            hash.toEthSignedMessageHash().recover(signature);

        require(recovered == user, "Invalid signature");

        nonces[user]++;
        _execute(user, data);
    }

    function _execute(address user, bytes calldata data) internal {
        (bool success, ) = address(this).call(
            abi.encodePacked(data, user)
        );
        require(success, "MetaTx call failed");
    }

    function _msgSender() internal view returns (address sender) {
        if (msg.sender == address(this)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            sender = msg.sender;
        }
    }
}
/* Test1
contract address 0x5736026adC59d3178fAecFCE293f9522F22957A2
account user 0x8605c4e90fa2fd77846bf434ff9d020fe370798a
bytes32 из getHash 0x8c8082525fdcda7d09431f7bea0010e99c14ca6ddf4ac277ce96a4c0fe05ee23
personal_sign: 0xea9211deb27e8b40cd7e93a24e68ac4e33c426fe031b24be4d62182f1713b130672980770bc69424db4ec379c22c2c60442243063cc7afb53995bd9b2a5d003d1b

Test2
bytes32 0xeabfc4a9d9e0e32e9cd5172b9d87d22e32621d80219bfcd0cdfd580e631f52f0
personal_sigh: 0xb2e9cdfd47bc9537e45ce7565ea494c1b672847f2130a8c7679baf82de1a3be8468e78e442f92867f5dff10d84594afc3375352d9f94e568caaaa4ae3fb22f481c

*/
