// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './SolveMe.sol';

contract SolveMeAttacker {
    SolveMe private immutable solveMe;

    constructor(address _solveMe) {
        solveMe = SolveMe(_solveMe);
    }

    function exploit() external {
        solveMe.solveChallenge();
    }
   
}