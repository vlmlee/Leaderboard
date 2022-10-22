import React, { useCallback, useContext, useEffect, useState } from 'react';
import '../stylesheets/Rewards.scss';
import { Web3Context } from '../App';
import { ethers } from 'ethers';
import { isEmpty } from 'lodash';
import {
    calculatePercentageChanged,
    convertStakeArrayToMap,
    getOriginalStakedAmount,
    getTotalReturnValues
} from '../helpers/stakesHelpers';
import convertToRanking from '../helpers/convertToRanking';
import { IRanking } from '../typings';

const Rewards = ({}) => {
    const [{ contract, stakes, rankings, maxLength }, setContext] = useContext(Web3Context);
    const [rewardPool, setRewardPool] = useState<string>('');
    const [initialFunding, setInitialFunding] = useState<string>('');

    useEffect(() => {
        async function getRewardPool() {
            if (!isEmpty(contract)) {
                const _rewardPool = await contract.rewardPool();
                setRewardPool(ethers.utils.formatEther(_rewardPool));
                const _initialFunding = await contract.initialFunding();
                setInitialFunding(ethers.utils.formatEther(_initialFunding));
            }
        }

        getRewardPool();

        async function getAllRankings() {
            if (!isEmpty(contract) && rankings.length < maxLength) {
                const _ranks = await contract.getAllRankings();
                const _rankings = _ranks
                    .map((_r: any) => convertToRanking(_r))
                    .sort((a: IRanking, b: IRanking) => a.rank - b.rank);

                setContext((prev: any) => {
                    return {
                        ...prev,
                        rankings: _rankings
                    };
                });
            }
        }

        getAllRankings();
    }, [contract]);

    const generateTableBody = useCallback(() => {
        let stakesMap = [];
        let originalStakes: any = {};
        let totalReturns: any = {
            totalReturnValues: {}
        };

        if (stakes && stakes.length) {
            stakesMap = convertStakeArrayToMap(stakes);
            originalStakes = getOriginalStakedAmount(stakesMap);

            const rankingChangedForId: any = Object.assign(
                {},
                ...rankings.map((_ranking: IRanking) => {
                    return {
                        [_ranking.id]: _ranking.startingRank - _ranking.rank
                    };
                })
            );

            totalReturns = getTotalReturnValues(rankingChangedForId, stakes, +rewardPool, +initialFunding);
        }

        return (
            <div className={'rewards__table-row'}>
                {Object.keys(totalReturns.totalReturnValues).map((key: string, index: number) => (
                    <div key={`rewards__table-row--${index}`} className={'rewards__table-element'}>
                        <div>
                            {key.slice(0, 6)}...{key.slice(key.length - 4)}
                        </div>
                        <div>{originalStakes[key].toFixed(3)} ETH</div>
                        <div>{totalReturns.totalReturnValues[key].toFixed(3)} ETH</div>
                        <div>
                            {calculatePercentageChanged(
                                originalStakes[key],
                                totalReturns.totalReturnValues[key]
                            ).toFixed(2)}
                            %
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [rewardPool, rankings, stakes, initialFunding]);

    return (
        <div className={'rewards info-sections'}>
            <div className={'rewards__content info-sections__content'}>
                <div className={'rewards__reward-pool'}>
                    <span className={'rewards__reward-pool__label'}>Reward pool:</span>{' '}
                    <span className={'rewards__reward-pool__amount'}>{rewardPool && rewardPool + ' ETH'}</span>
                </div>
                <div className={'rewards__current-payouts'}>Current payouts:</div>
                <div className={'rewards__table-header'}>
                    <div>Address</div>
                    <div>Original Stake</div>
                    <div>Expected Reward</div>
                    <div>% Gain/Loss</div>
                </div>
                <div className={'rewards__table-body'}>{generateTableBody()}</div>
            </div>
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
};

export default Rewards;
