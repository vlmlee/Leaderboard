import React from 'react';
import { IRanking } from '../typings';
import '../stylesheets/ListRow.scss';

interface IListRow extends IRanking {
    stakeToRanking: (rank: number, name: string) => void;
}

export default function ListRow({ rank, name, netWorth, country, imgUrl, stakers, stakeToRanking }: IListRow) {
    return (
        <div className={'list__row'}>
            <div className={'list__element'}>
                <span className={'list__element--rank'}>{rank}</span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--name'}>{name}</span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--net-worth'}>{netWorth}</span>
            </div>
            <div className={'list__element'}>{country}</div>
            <div className={'list__element'}>
                <button className={'list__element--stake-button'} onClick={() => stakeToRanking(rank, name)}>
                    Stake
                </button>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--stakers'}>{stakers} / total stakers </span>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--total-value-locked'}>
                    <span className={'list__element--total-value-locked--none'}>{'---'}</span> eth
                </span>
            </div>
        </div>
    );
}
