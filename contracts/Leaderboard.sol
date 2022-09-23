// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Leaderboard is ReentrancyGuard {
    address public facilitator;
    bytes32 public name;
    uint32 public endTime;
    uint256 public rewardPool;
    uint8 public rankingsSize;

    event UserStakeAdded(address indexed user, Stake stake);

    struct Ranking {
        uint32 id; // Id to make sure that name is unique
        bytes32 name;
        uint8 rank;
        bytes[] data; // arbitrary criteria for ranking
    }
    mapping(uint8 => Ranking) public Rankings; // Index starts at 0

    struct Stake {
        address user;
        uint32 id;
        bytes32 name;
        uint256 liquidity; // a user's stake
    }
    mapping(address => Stake) public UserStakes;

    error UserAlreadyStaked();
    error OnlyFacilitator();

    constructor(bytes32 memory _name) {
        facilitator = msg.sender;
        name = _name;
    }

    function getRanking(uint8 rank) public view returns (Ranking memory) {
        return Rankings[rank];
    }

    function getRewardPool() public view returns (uint256) {
        return rewardPool;
    }

    function getEndTime() public view returns (uint32) {
        return endTime;
    }

    function addRanking() external {
        rankingsSize++;
    }

    function addStake() external payable {

    }

    function withdrawStake() external {
        uint256 userStakedAmount = UserStakes[msg.sender].liquidity;

        payable(msg.sender).transfer(userStakedAmount);
    }

    // Internal functions

    function removeRanking() internal {

    }

    function allocateRewards() internal returns () {

    }

    function calculateRewardForAddress(address user) returns (uint256) {
        return;
    }

    function destroyContract() internal  {
        if (msg.sender != facilitator) revert OnlyFacilitator();

        // return funds to addresses
        for (uint i = 0; i < rankingsSize; i++) {
            withdrawStake(UserStakes[i].user);
        }

        // self destruct, all remaining ETH goes to facilitator
        selfdestruct(facilitator);
    }

    function addToRewardPool(uint256 liquidity) internal returns (uint256 memory) {
        rewardPool += liquidity;
        return rewardPool;
    }

    function removeFromRewardPool(uint256 liquidity) internal returns (uint256 memory) {
        rewardPool -= liquidity;
        return rewardPool;
    }
}
