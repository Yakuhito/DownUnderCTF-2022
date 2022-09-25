// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Lootoor {
    function drain() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}