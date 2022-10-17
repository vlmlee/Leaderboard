import React from 'react';
import { Ranking } from './ListContainer';
import '../stylesheets/List.scss';

export default function List({ rank, name, netWorth, country, imgUrl }: Ranking) {
    return (
        <div className={'list__element'}>
            <div className={'rank'}>
                <span>{rank}</span>
            </div>
            <div>{name}</div>
            <div style={{ color: '#52b788' }}>{netWorth}</div>
            <div>{country}</div>
            {/*<img src={imgUrl} alt={"..."}/>*/}
            <div>
                <button className={'list__element__stake-button'}>Stake</button>
            </div>
        </div>
    );
}
