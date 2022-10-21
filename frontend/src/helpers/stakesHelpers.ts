import { IRanking } from '../typings';
import { ethers } from 'ethers';

function convertStakeArrayToMap(arr: any) {
    return arr.reduce((acc: any, cur: any) => {
        // cur[0] - address, cur[3] - liquidity
        if (acc[cur[0]]) {
            acc[cur[0]] = acc[cur[0]].concat([cur]);
        } else {
            acc[cur[0]] = [cur];
        }
        return acc;
    }, {});
}

function getOriginalStakedAmount(stakes: Object) {
    const arr = Object.entries(stakes);
    return Object.assign(
        {},
        ...arr.map(([address, _stakes]: any, index: number) => {
            return {
                [address]: _stakes.reduce((a: any, c: any) => {
                    a = a + +ethers.utils.formatEther(c[3]);
                    return a;
                }, 0)
            };
        })
    );
}

// get ranking changed * staked amount
function calculateWeightsForPool(rewardPool: number | string, rankings: IRanking[], stakes: any): number[] {
    const rankingChangedForId: any = Object.assign(
        {},
        ...rankings.map((_ranking: IRanking) => {
            return {
                [_ranking.id]: _ranking.startingRank - _ranking.rank
            };
        })
    );

    const stakesToUse: any = stakes.filter((_stake: any) => {
        return rankingChangedForId[_stake.id] !== 0;
    });

    return stakesToUse.map((_stake: any) => {
        return +ethers.utils.formatEther(_stake.liquidity) * (1 + 0.1 * rankingChangedForId[_stake.id]);
    });
}

function calculateWeightsForReward(rankings: IRanking[], stakes: any): number[] {
    const rankingsToUse = rankings.filter((_ranking, index) => _ranking.startingRank - _ranking.rank > 0);

    const rankingChangedForId = rankingsToUse.map((_ranking: IRanking) => {
        return {
            [_ranking.id]: _ranking.startingRank - _ranking.rank
        };
    });

    const stakesToUse = stakes.filter((_stake: any) => {
        const existInRankingsToUse = rankingsToUse.findIndex(_ranking => _ranking.id === _stake[1]) > -1;

        // @ts-ignore
        return existInRankingsToUse && rankingChangedForId[_stake[1]] !== 0;
    });

    return stakesToUse.map((_stake: any) => {
        return _stake[3] * (1 + 0.1 * +rankingChangedForId[_stake[1]]);
    });
}

function calculateNormForPool() {}

function calculateNormForReward(initialReward: number, rankings: any, stakes: any) {
    const weightsSum = calculateWeightsForReward(rankings, stakes).reduce((acc: number, cur: number) => {
        acc = acc + cur;
        return acc;
    }, 0);
}

function calculateRewards() {}

function calculatePercentageChanged() {}

export { convertStakeArrayToMap, getOriginalStakedAmount, calculateWeightsForPool, calculateWeightsForReward };
