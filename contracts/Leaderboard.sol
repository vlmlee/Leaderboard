// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

contract Leaderboard {
    mapping(address => boolean) public Stakeholders;
    mapping(bytes32 => uint256) public Candidates;

    event VoteAdded(uint256 indexed user, bytes32 competitor);

    error UserAlreadyVoted();

    constructor(bytes32 name) {

    }

    function addVote(bytes32 competitor) payable external {
        if (Stakeholders[msg].sender) revert UserAlreadyVoted();

        Stakeholders[msg.sender] = 1;

        if (Candidates[competitor]) {
            Candidates[competitor]++;
        } else {
            Candidates[competitor] = 1;
        }

        emit VoteAdded(msg.sender, competitor);
    }

    function withdrawVote() external {

    }

    function slashVote() external {

    }

    function addCompetitor() external {

    }
}
