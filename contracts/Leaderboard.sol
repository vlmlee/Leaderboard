// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Leaderboard is ReentrancyGuard {
    address public facilitator;
    bytes32 public name;
    LeaderboardType public leaderboardType;
    uint32 public endTime;
    uint256 public rewardPool;
    uint8 public rankingId = 1;
    uint8 public rankingsSize = 0;

    event UserStakeAdded(address indexed user, Stake stake);

    struct Ranking {
        uint32 id; // Id to make sure that name is unique
        bytes32 name;
        uint8 rank;
        bytes data; // arbitrary criteria for ranking
    }
    mapping(uint8 => Ranking) public Rankings; // Index starts at 1

    struct Stake {
        address user;
        uint32 id;
        bytes32 name;
        uint256 liquidity; // a user's stake
    }
    mapping(address => Stake) public UserStakes;

    enum LeaderboardType { FIRST_PAST_THE_POST, RANK_CHOICE, RANK_CHANGED }

    error UserAlreadyStaked();
    error UserHasNotStakedYet();
    error OnlyFacilitator();
    error ContractEnded();
    error UnableToWithdrawStake();
    error RankingDoesNotExist();

    constructor(bytes32 memory _name, uint8 leaderboardTypeInt, uint32 _endTime) {
        facilitator = msg.sender;
        name = _name;
        endTime = _endTime;
        setLeaderboardType(leaderboardTypeInt);
    }

    function getRanking(uint8 rank) public view returns (Ranking memory) {
        return Rankings[rank];
    }

    function addRanking(bytes32 name, uint8 rank, bytes data) external {
        require(msg.sender == facilitator);

        Ranking memory ranking = Rankings[rank];
        ranking.id = rankingId;
        ranking.name = name;
        ranking.rank = rank;
        ranking.data = data;

        rankingId++;
        rankingsSize++;
    }

    function addStake(uint32 id, bytes32 name) external payable {
        if (block.timestamp > endTime) revert ContractEnded();

        Stake memory stake = UserStakes[msg.sender];
        stake.user = msg.sender;
        stake.liquidity = msg.value;
        stake.id = id;
        stake.name = name;
    }

    function withdrawStake() external nonReentrant {
        if (!UserStakes[msg.sender]) {
            revert UserHasNotStakedYet();
        }

        uint256 userStakedAmount = UserStakes[msg.sender].liquidity;
        (bool success, ) = payable(msg.sender).call.value(userStakedAmount)("");

        if (success) {
            delete UserStakes[msg.sender];
        } else {
            revert UnableToWithdrawStake();
        }
    }

    // Internal functions

    function setLeaderboardType(uint8 leaderboardTypeInt) internal {
        require(leaderboardTypeInt <= uint(LeaderboardType.RANK_CHANGED));
        leaderboardType = LeaderboardType(leaderboardTypeInt);
    }

    function removeRanking(uint8 id, uint8 rank, bytes32 name) internal {
        require(msg.sender == facilitator);

        if (Rankings[rank]) {
            Ranking memory ranking = Rankings[rank];
            require(ranking.id == id && ranking.name == name);
            delete Rankings[rank];
        } else {
            revert RankingDoesNotExist();
        }
    }

    function addToRewardPool(uint256 liquidity) internal returns (uint256 memory) {
        rewardPool += liquidity;
        return rewardPool;
    }

    function removeFromRewardPool(uint256 liquidity) internal returns (uint256 memory) {
        rewardPool -= liquidity;
        return rewardPool;
    }

    function allocateRewards() internal returns () {

    }

    function calculateRewardForAddress(address user) internal returns (uint256) {
        // Contract type:
        // 1. First past the post
        // 2. Rank choice
        // 3. Rank changed

        return;
    }

    function allocateFirstPastThePostReward() internal {
        // winner takes all
    }

    function allocateRankChoiceReward() internal {
        // reward is proportional to the ranking achieved by an option
    }

    function allocateRankChangedReward() internal {
        // reward is proportional to the ranking changed
    }

    function destroyContract() internal {
        if (msg.sender != facilitator) revert OnlyFacilitator();

        // return funds to addresses
        for (uint8 i = 0; i < rankingsSize; i++) {
            withdrawStake(UserStakes[i].user);
        }

        // self destruct, all remaining ETH goes to facilitator
        selfdestruct(facilitator);
    }
}
