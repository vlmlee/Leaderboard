import { ethers } from 'ethers';
import { IRanking } from '../typings';

function convertStakeArrayToMap(arr: any) {
    return arr.reduce((acc: any, cur: any) => {
        // cur[0] - address, cur[3] - liquidity
        if (acc[cur[0]]) {
            acc[cur[0]] = acc[cur[0]].concat(cur);
        } else {
            acc[cur[0]] = [cur];
        }
        return acc;
    }, {});
}

function getOriginalStakedAmount(stakes: Object) {
    return Object.entries(stakes).map(([address, stakes]: [string, any], index: number) => {
        return {
            [address]: stakes.reduce((a: any, c: any) => {
                a = a + +ethers.utils.formatEther(c[3]);
                return a;
            }, 0)
        };
    });
}

// get ranking changed * staked amount
function calculateWeightsForPool(rewardPool: number | string, rankings: IRanking[], stakes: any) {
    const rankingChangedForId = rankings.map((_ranking: IRanking) => {
        return {
            [_ranking.id]: _ranking.startingRank - _ranking.rank
        };
    });

    const stakesToUse = stakes.filter((_stake: any) => {
        // @ts-ignore
        return rankingChangedForId[_stake[1]] !== 0;
    });

    return stakesToUse.map((_stake: any) => {
        return _stake[3] * (1 + 0.1 * +rankingChangedForId[_stake[1]]);
    });
}

function calculateWeightsForReward(initialReward: number | string, rankings: IRanking[], stakes: any) {
    const rankingsToUse = rankings.filter((_ranking, index) => _ranking.startingRank - _ranking.rank > 0);
    return;
}

function calculateNormForPool() {}

function calculateNormForReward() {}

function calculateRewards() {}

function calculatePercentageChanged() {}

export {};
