// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Leaderboard.sol";

contract SubstackLeaderboard is Leaderboard {

    constructor(uint256 _endTime, uint256 _commissionFee) Leaderboard(bytes32("Substack Leaderboard"), _endTime, _commissionFee) {

    }
}