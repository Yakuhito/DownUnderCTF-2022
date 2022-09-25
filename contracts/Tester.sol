// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Tester {

    function test() external view {
        uint256 a;
        assembly {
            a := shl(0xc8, 0xFD28448C97D19C)
        }

        console.log("Result: %s", a);
    }

}