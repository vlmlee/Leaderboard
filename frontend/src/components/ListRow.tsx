import React, { useContext } from 'react';
import { IRanking } from '../typings';
import '../stylesheets/ListRow.scss';
import { Web3Context } from '../App';

interface IListRow extends IRanking {
    stakeToRanking: (rank: number, name: string) => void;
}

export default function ListRow({ rank, name, netWorth, country, imgUrl, stakers, stakeToRanking }: IListRow) {
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
                <button className={'list__element--stake-button'} onClick={() => stakeToRanking(rank, name)}>
                    Stake
                </button>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--stakers'}>
                    {stakers} / {(stakes && stakes.length) ?? 0}{' '}
                </span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--total-value-locked'}>
                    <span className={'list__element--total-value-locked--none'}>{'---'}</span> eth
                </span>
            </div>
        </div>
    );
}
