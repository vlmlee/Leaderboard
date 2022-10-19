import React from 'react';
import { IRanking } from '../typings';
import '../stylesheets/ListRow.scss';

export default function ListRow({ rank, name, netWorth, country, imgUrl, stakers }: IRanking) {
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
            <div className={'list__element'}>
                <span className={'list__element--total-value-locked'}>{0} eth</span>
            </div>
        </div>
    );
}
