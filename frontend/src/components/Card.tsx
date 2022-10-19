import React from 'react';
import '../stylesheets/Card.scss';
import { IRanking } from '../typings';

const Card: React.FC<IRanking> = ({ rank, name, netWorth, country, imgUrl, isLoading, classes }: IRanking) => {
    return (
        <div className={'card__element card__element--' + classes}>
            {isLoading && (
                <div className={'card__element__loading'}>
                    <div>IsLoading</div>
                </div>
            )}
            {!isLoading && (
                <div className={'card__element--ready'}>
                    <div className={'rank'}>No. {rank}</div>
                    <img className="photo" src={imgUrl} alt={'...'} />
                    <div className={'info'}>
                        <div className={'name'}>{name}</div>
                        <div className={'net-worth'}>
                            <span style={{ fontSize: '14px' }}>Net Worth</span>
                            <br />
                            <span style={{ color: '#52b788' }}>{netWorth}</span>
                        </div>
                        <div className={'country'}>{country}</div>
                    </div>
                    <div>
                        <div>Stake</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;
