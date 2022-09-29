// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Leaderboard.sol";
import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';

contract ForbesLeaderboard is Leaderboard, ChainlinkClient {

    constructor(bytes32 _name, uint8 _leaderboardTypeInt, uint256 _endTime) Leaderboard(_name, _leaderboardTypeInt, _endTime) { }

    function getForbes100RichestPeople() internal {
        // get rankings: name, rank, net worth (convert to bytes)
//        addRanking();
    }


}