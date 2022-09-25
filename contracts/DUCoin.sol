//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DUCoin is ERC20, Ownable {
    constructor() ERC20("DUCoin", "DUC") {}

    function freeMoney(address addr) external onlyOwner {
        _mint(addr, 1337);
    }
}

