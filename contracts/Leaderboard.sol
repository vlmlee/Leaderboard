// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Leaderboard {
    address public facilitator;
    bytes32 public leaderboardName;
    uint256 public endTime;
    uint256 public rewardPool;

    event RankingAdded(Ranking _ranking);
    event RankingRemoved(Ranking _ranking);
    event RankingUpdated(Ranking _ranking);
    // These two events are to indicate swapped data between two rankings
    event RankingUpdatedFrom(Ranking _ranking);
    event RankingUpdatedTo(Ranking _ranking);
    //
    event UserStakeAdded(address indexed _user, Stake _stake);
    event UserStakeWithdrawn(address indexed _user, Stake _stake);
    event ContractDestroyed();

     modifier OnlyFacilitator() {
        if (msg.sender != facilitator) revert UserIsNotFacilitator();
        _;
    }

    modifier GreaterThanOneRank(uint8 _rank) {
        if (_rank < 1) revert RankNeedsToBeGreaterThanOne();
        _;
    }

    modifier HasContractEnded(uint256 _endTime) {
        if (block.timestamp > endTime) revert ContractEnded(endTime, block.timestamp);
        _;
    }

    struct Ranking {
        uint8 id; // ID to make sure that the choice is unique.
        bytes32 name;
        uint8 rank;
        bytes data; // arbitrary criteria for ranking
    }

    mapping(uint8 => Ranking) public rankings;
    uint8 public rankingsCurrentId;
    uint8 public rankingsSize;

    struct Stake {
        address addr;
        uint8 id;
        bytes32 name;
        uint256 liquidity; // a user's stake
    }

    mapping(uint8 => Stake[]) public userStakes;
    uint256 public userStakesSize;

    error UserIsNotFacilitator();
    error RankNeedsToBeGreaterThanOne();
    error UserAlreadyStaked(string _errorMessage);
    error UserHasNotStakedYet(address _user);
    error ContractEnded(uint256 _endTime, uint256 _currentTime);
    error UnableToWithdrawStake(address _user);
    error RankingDoesNotExist(uint8 _id, uint8 _rank, bytes32 _name);
    error RankingAlreadyExists(uint8 _rank);
    error RankingUpdateArgsAreInvalid();
    error RankingNameCannotBeEmpty();
    error RankingNameSuppliedIsTheSame();
    error RankingDataArgCannotBeEmpty();
    error RankingDataSuppliedIsTheSame();
    error NoStakesAddedForRankingYet(uint8 _id);

    constructor(bytes32 _leaderboardName, uint256 _endTime) {
        facilitator = msg.sender;
        leaderboardName = _leaderboardName;
        endTime = _endTime;
    }

    receive() external payable {}

    function getRanking(uint8 _rank) public view GreaterThanOneRank(_rank) returns (Ranking memory ranking) {
        for (uint8 i = 0; i < rankingsCurrentId; i++) {
            if (rankings[i].rank == _rank) {
                ranking = rankings[i];
            }
        }

        if (ranking.rank == 0) revert RankingDoesNotExist(0, _rank, bytes32(0));
    }

    function addRanking(uint8 _rank, bytes32 _name, bytes calldata _data) public OnlyFacilitator GreaterThanOneRank(_rank) {
        require(_name != 0, "A name has to be used to be added to the rankings.");

        Ranking storage ranking = rankings[rankingsCurrentId];

        for (uint8 i = 0; i < rankingsCurrentId; i++) {
            if (rankings[i].rank == _rank) {
                revert RankingAlreadyExists(_rank);
            }
        }

        ranking.id = rankingsCurrentId;
        ranking.name = _name;
        ranking.rank = _rank;
        ranking.data = _data;

        rankingsCurrentId++;
        rankingsSize++;

        emit RankingAdded(ranking);
    }

    function removeRanking(uint8 _id, uint8 _rank, bytes32 _name) public OnlyFacilitator GreaterThanOneRank(_rank) {
        Ranking storage ranking = rankings[_id];

        // Since rank can't be zero, if ranking.rank = 0, it means the ranking doesn't exist.
        if (ranking.rank != 0) {
            require(ranking.rank == _rank && ranking.name == _name, "Ranking choice does not exist.");

            if (userStakesSize > 0) {
                returnStakes(_id);
            }
            emit RankingRemoved(ranking);

            delete rankings[_id];
            rankingsSize--;
        } else {
            revert RankingDoesNotExist(_id, _rank, _name);
        }
    }

    function swapRank(uint8 idFrom, uint8 rankFrom, uint8 idTo, uint8 rankTo) public
        OnlyFacilitator
        GreaterThanOneRank(rankFrom)
        GreaterThanOneRank(rankTo)
    {
        Ranking storage rankingFrom = rankings[idFrom];
        Ranking storage rankingTo = rankings[idTo];

        if (rankingFrom.rank == 0) revert RankingDoesNotExist(0, rankFrom, bytes32(0));
        if (rankingTo.rank == 0) revert RankingDoesNotExist(0, rankTo, bytes32(0));

        // Only swap ranks if both queries match existing ranks.
        if (rankingFrom.rank == rankFrom && rankingTo.rank == rankTo) {
            rankingFrom.rank = rankTo;
            rankingTo.rank = rankFrom;

            emit RankingUpdatedFrom(rankingFrom);
            emit RankingUpdatedTo(rankingTo);
        } else {
            revert RankingUpdateArgsAreInvalid();
        }
    }

    function updateName(uint8 _id, bytes32 _name) public OnlyFacilitator {
        Ranking storage ranking = rankings[_id];

        if (ranking.rank == 0) revert RankingDoesNotExist(_id, 0, bytes32(0));
        if (_name == bytes32(0)) revert RankingNameCannotBeEmpty();
        if (_name == ranking.name) revert RankingNameSuppliedIsTheSame();

        ranking.name = _name;

        emit RankingUpdated(ranking);
    }

    function updateData(uint8 _id, bytes calldata _data) public OnlyFacilitator {
        Ranking storage ranking = rankings[_id];

        if (ranking.rank == 0) revert RankingDoesNotExist(_id, 0, bytes32(0));
        if (_data.length == 0) revert RankingDataArgCannotBeEmpty();
        if (keccak256(abi.encodePacked(_data)) == keccak256(abi.encodePacked(ranking.data))) revert RankingDataSuppliedIsTheSame();

        ranking.data = _data;

        emit RankingUpdated(ranking);
    }

    function addStake(uint8 _id, bytes32 _name) public virtual HasContractEnded(endTime) payable {
        if (_id >= rankingsCurrentId) revert RankingDoesNotExist(_id, 0, bytes32(0));

        Ranking memory ranking = rankings[_id];
        if (ranking.rank == 0) revert RankingDoesNotExist(_id, 0, bytes32(0));
        if (_name != ranking.name) revert RankingDoesNotExist(_id, ranking.rank, bytes32(0));
        require(msg.value > 0, "Stake has to be a non-zero amount.");

        Stake[] storage stakes = userStakes[_id];

        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].addr == msg.sender) {
                revert UserAlreadyStaked("User has already staked for this choice. Withdraw your initial stake first if you want to change your stake.");
            }
        }

        Stake memory stake = Stake({
            addr: msg.sender,
            liquidity: msg.value,
            id: _id,
            name: _name
        });

        stakes.push(stake);

        uint256 rewardPoolAfter = addToRewardPool(stake.liquidity);
        assert(rewardPoolAfter >= stake.liquidity);
        userStakesSize++;

        emit UserStakeAdded(msg.sender, stake);
    }

    function withdrawStake(address _user, uint8 _id) public virtual HasContractEnded(endTime) {
        require(msg.sender == _user || msg.sender == facilitator, "Transaction sender is neither the owner of the stake or the facilitator.");
        if (userStakes[_id].length == 0) revert NoStakesAddedForRankingYet(_id);
        
        Stake[] storage stakes = userStakes[_id];
        Stake memory stake;
        uint256 indexToRemove;

        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].addr == _user) {
                stake = stakes[i];
                indexToRemove = i;
                break;
            }
        }

        if (stake.addr == address(0)) {
            revert UserHasNotStakedYet(_user);
        }

        uint256 userStakedAmount = stake.liquidity;
        assert(userStakedAmount > 0);
        assert(rewardPool > 0);
        assert(payable(address(this)).balance > 0);
        (bool success, ) = payable(_user).call{ value: userStakedAmount }("");

        if (success) {
            uint256 rewardPoolPrev = rewardPool;
            uint256 rewardPoolAfter = removeFromRewardPool(userStakedAmount);
            assert(rewardPoolAfter < rewardPoolPrev);

            delete stakes[indexToRemove];
            if (stakes.length > 0) {
                // Trick to remove unordered elements in an array in O(1) without needing to shift elements.
                stakes[indexToRemove] = stakes[stakes.length - 1]; // Copy the last element to the removed element's index.
                stakes.pop();
            }

            if (userStakesSize > 0) {
                userStakesSize--;
            }

            emit UserStakeWithdrawn(_user, stake);
        } else {
            revert UnableToWithdrawStake(_user);
        }
    }

    /**
     * Allocation depends on what type of contract the owner wants to implement.
     * Examples:
     *  Contract types:
     *  1. First past the post: winner takes all.
     *  2. Rank choice: reward is proportional to the ranking achieved.
     *  3. Rank changed: reward is proportional to the ranking net change.
     */
    function allocateReward() external virtual OnlyFacilitator HasContractEnded(endTime) {

    }

    function destroyContract() external OnlyFacilitator {
        uint8 i = 0;

        while (userStakesSize > 0 && i <= rankingsCurrentId) {
            returnStakes(i);
            i++;
        }

        emit ContractDestroyed();
        // self destruct, all remaining ETH goes to facilitator
        selfdestruct(payable(facilitator));
    }

    // Internal functions

    function returnStakes(uint8 _id) internal OnlyFacilitator {
        require(userStakesSize > 0, "There are currently no stakes to return.");

        Stake[] memory stakes = userStakes[_id];

        for (uint256 i = 0; i < stakes.length; i++) {
            Stake memory stake = stakes[i];

            require(stake.id == _id, "ID does not match.");

            uint256 userStakedAmount = stake.liquidity;
            assert(userStakedAmount > 0);
            (bool success, ) = payable(stake.addr).call{ value: userStakedAmount }("");

            if (success) {
                uint256 rewardPoolPrev = rewardPool;
                uint256 rewardPoolAfter = removeFromRewardPool(userStakedAmount);
                assert(rewardPoolAfter < rewardPoolPrev);
                
                if (userStakesSize > 0) {
                    userStakesSize--;
                }
            } else {
                revert UnableToWithdrawStake(stake.addr);
            }
        }

        delete userStakes[_id];
    }

    function addToRewardPool(uint256 _liquidity) internal returns (uint256) {
        rewardPool += _liquidity;
        return rewardPool;
    }

    function removeFromRewardPool(uint256 _liquidity) internal returns (uint256) {
        rewardPool -= _liquidity;
        return rewardPool;
    }
}
