// SPDX-License-Identifier: Unlicense
//pragma solidity ^0.8.9;
//
//import "./Leaderboard.sol";
//import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
//
//contract ForbesLeaderboard is Leaderboard, ChainlinkClient {
//
//    constructor(uint256 _endTime, uint256 _commissionFee) Leaderboard(bytes32("Forbes Leaderboard"), _endTime, _commissionFee) {
//        facilitator = msg.sender;
//    }
//
//    function updateForbesList() internal {
//        // get rankings: name, rank, net worth (convert to bytes)
//        //        addRanking();
//    }
//
//
//}