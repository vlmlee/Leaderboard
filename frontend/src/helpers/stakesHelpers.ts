import { ethers } from 'ethers';
import onlyUnique from './onlyUnique';

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

function calculateWeight(stakes: any, rankingChangedForId: any) {
    return stakes.map((_stake: any) => {
        return {
            addr: _stake.addr,
            weight:
                +ethers.utils.formatEther(_stake.liquidity) *
                (1 + 0.1 * normalizeDeltaCoefficient(rankingChangedForId[_stake.id]))
        };
    });
}

// get ranking changed * staked amount
function calculateWeightsForPool(stakes: any, rankingChangedForId: any): number[] {
    const stakesToUse: any = stakes.filter((_stake: any) => {
        return rankingChangedForId[_stake.id] !== 0;
    });

    return calculateWeight(stakesToUse, rankingChangedForId);
}

function normalizeDeltaCoefficient(value: number) {
    if (value > 10) {
        return 10;
    } else if (value < -10) {
        return -10;
    } else {
        return value;
    }
}

function calculateWeightsForReward(stakes: any, rankingChangedForId: any): number[] {
    const stakesToUse = stakes.filter((_stake: any) => {
        return rankingChangedForId[_stake[1]] > 0;
    });

    return calculateWeight(stakesToUse, rankingChangedForId);
}

function calculateNormForReward(rewardPool: number, weights: number[]) {
    const weightsSum = weights.reduce((acc: number, cur: number) => {
        acc = acc + cur;
        return acc;
    }, 0);

    return rewardPool / weightsSum;
}

function calculateRewardPoolAfterReturns(rewardPool: number, stakes: any, rankingChangedForId: any) {
    const stakesToUse = stakes.filter((_stake: any) => {
        return rankingChangedForId[_stake.id] === 0;
    });

    const stakesToUseSum: number = stakesToUse.reduce((acc: any, cur: any) => {
        acc = acc + +ethers.utils.formatEther(cur.liquidity);
        return acc;
    }, 0);

    return {
        rewardPool: rewardPool - stakesToUseSum,
        ...Object.assign(
            {},
            ...stakesToUse.map((_stake: any) => {
                return {
                    [_stake.addr]: +ethers.utils.formatEther(_stake.liquidity)
                };
            })
        )
    };
}

function calculatePercentageChanged(initial: number, after: number) {
    return (100 * (after - initial)) / initial;
}

function getReturnValuesForReward(rankingChangedForId: any, stakes: any, rewardPool: number, initialFunding: number) {
    const weightsArr = calculateWeightsForPool(stakes, rankingChangedForId);
    const rewardPoolAfterReturns = calculateRewardPoolAfterReturns(rewardPool, stakes, rankingChangedForId);

    const norm = calculateNormForReward(
        rewardPoolAfterReturns.rewardPool - initialFunding,
        weightsArr.map((w: any) => w.weight)
    );

    const refunds = Object.assign(
        {},
        ...Object.keys(rewardPoolAfterReturns)
            .filter((k: string) => k !== 'rewardPool')
            .map((k: string) => {
                return { [k]: rewardPoolAfterReturns[k] };
            })
    );

    return {
        returnValues: weightsArr.map((w: any) => {
            return {
                addr: w.addr,
                returnValue: w.weight * norm
            };
        }),
        refunds: refunds
    };
}

function getReturnValuesForInitialFunding(rankingChangedForId: any, stakes: any, initialFunding: number) {
    const initialFundingWeight = calculateWeightsForReward(stakes, rankingChangedForId);
    const rewardNorm = calculateNormForReward(
        initialFunding,
        initialFundingWeight.map((w: any) => w.weight)
    );

    return initialFundingWeight.map((w: any) => {
        return {
            addr: w.addr,
            returnValue: w.weight * rewardNorm
        };
    });
}

function getTotalReturnValues(rankingChangedForId: any, stakes: any, rewardPool: number, initialFunding: number) {
    const returnValuesForReward = getReturnValuesForReward(rankingChangedForId, stakes, rewardPool, initialFunding);
    const returnValuesForInitialFunding = getReturnValuesForInitialFunding(rankingChangedForId, stakes, initialFunding);

    const allStakers = [
        ...returnValuesForReward.returnValues.map((rv: any) => rv.addr),
        ...returnValuesForInitialFunding.map((rv: any) => rv.addr),
        ...Object.keys(returnValuesForReward.refunds)
    ].filter(onlyUnique);

    const totalReturnValues = Object.assign(
        {},
        ...allStakers.map((addr: string) => {
            const rewardAmounts = [...returnValuesForReward.returnValues, ...returnValuesForInitialFunding].reduce(
                (acc: any, cur: any) => {
                    if (cur.addr === addr) {
                        acc = acc + cur.returnValue;
                    }

                    return acc;
                },
                0
            );

            return {
                [addr]: rewardAmounts + returnValuesForReward.refunds[addr]
            };
        })
    );

    return {
        returnValuesForReward: returnValuesForReward.returnValues,
        returnValuesForInitialFunding,
        refunds: returnValuesForReward.refunds,
        totalReturnValues: totalReturnValues
    };
}

export {
    convertStakeArrayToMap,
    getOriginalStakedAmount,
    calculateWeightsForPool,
    calculateWeightsForReward,
    calculateNormForReward,
    calculateRewardPoolAfterReturns,
    getReturnValuesForReward,
    getReturnValuesForInitialFunding,
    getTotalReturnValues,
    calculatePercentageChanged
};
