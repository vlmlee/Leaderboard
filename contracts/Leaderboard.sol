// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

contract Leaderboard {
    mapping(address => boolean) public Stakes;
    mapping(string => uint256) public Rankings;

    event VoteAdded(uint256 indexed user, string competitor);

    error UserAlreadyVoted();

    constructor() {

    }

    function addVote(string competitor) external {
        if (Stakes[msg].sender) revert UserAlreadyVoted();

        Stakes[msg.sender] = 1;

        if (Rankings[competitor]) {
            Rankings[competitor]++;
        } else {
            Rankings[competitor] = 1;
        }

        emit VoteAdded(msg.sender, competitor);
    }

    function withdrawVote() {

    }

    function slashVote() {

    }
}
