import React, { useContext } from 'react';
import { IRanking } from '../typings';
import '../stylesheets/ListRow.scss';
import { Web3Context } from '../App';

interface IListRow extends IRanking {
    stakeToRanking: (rank: number, name: string) => void;
    withdrawStake: (id: number) => void;
    isStaker?: boolean;
    liquidity: string | number;
}

export default function ListRow({
    id,
    rank,
    name,
    netWorth,
    country,
    imgUrl,
    stakers,
    liquidity,
    isStaker,
    stakeToRanking,
    withdrawStake
}: IListRow) {
    const [{ stakes }] = useContext(Web3Context);

    return (
        <div className={'list__row'}>
            <div className={'list__element'}>
                <span className={'list__element--rank'}>{rank}</span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--name'}>{name}</span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--net-worth'}>{'$' + +netWorth / 1000 + ' B'}</span>
            </div>
            <div className={'list__element'}>{country}</div>
            <div className={'list__element'}>
                {!isStaker && (
                    <button className={'list__element--stake-button'} onClick={() => stakeToRanking(rank, name)}>
                        Stake
                    </button>
                )}
                {isStaker && (
                    <button className={'list__element--withdraw-button'} onClick={() => withdrawStake(id)}>
                        Withdraw
                    </button>
                )}
            </div>
            <div className={'list__element'}>
                <span className={'list__element--stakers'}>
                    {stakers} / {(stakes && stakes.length) ?? 0}{' '}
                </span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--total-value-locked'}>
                    {liquidity || <span className={'list__element--total-value-locked--none'}>{'---'}</span>} ETH
                </span>
            </div>
        </div>
    );
}
