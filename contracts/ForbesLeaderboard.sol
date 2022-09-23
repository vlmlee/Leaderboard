// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.9;

import "./Leaderboard.sol";
import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';

contract ForbesLeaderboard is Leaderboard("Forbes",
    2 // LeaderboardType.RANK_CHANGED
, block.timestamp + 1 years), ChainlinkClient {

    function getForbes100RichestPeople() {
        // get rankings: name, rank, net worth (convert to bytes)
        addRanking();
    }


}