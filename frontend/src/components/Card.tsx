import React from 'react';
import '../stylesheets/Card.scss';
import { IRanking } from '../typings';

const Card: React.FC<IRanking> = ({ id, rank, name, netWorth, country, imgUrl, isLoading, classes }: IRanking) => {
    return (
        <div className={'card__element card__element--' + classes}>
            {isLoading && (
                <div className={'card__element__loading'}>
                    <div>IsLoading</div>
                </div>
            )}
            {!isLoading && (
                <div className={'card__element--ready'}>
                    <div className={'card__element__rank'}>No. {rank}</div>
                    <img className="card__element__photo" src={imgUrl} alt={'...'} />
                    <div className={'card__element-info'}>
                        <div className={'card__element-info--name'}>{name}</div>
                        <div className={'card__element-info--net-worth'}>
                            <span style={{ fontSize: '14px' }}>Net Worth</span>
                            <br />
                            <span style={{ color: '#52b788' }}>{netWorth}</span>
                        </div>
                        <div className={'card__element-info--country'}>{country}</div>
                    </div>
                </div>
            )}
            <div className={'card__element__stake-button'}>
                <button>Stake</button>
            </div>
        </div>
    );
};

export default Card;
