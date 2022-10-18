import React from 'react';
import { Ranking } from './ListContainer';
import '../stylesheets/ListRow.scss';

export default function ListRow({ rank, name, netWorth, country, imgUrl, stakers }: Ranking) {
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
                <button className={'list__element--stake-button'}>Stake</button>
            </div>
            <div className={'list__element'}>
                <span className={'list__element--stakers'}>{stakers} / total stakers </span>
            </div>
        </div>
    );
}
