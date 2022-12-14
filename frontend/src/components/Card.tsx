import React from 'react';
import '../stylesheets/Card.scss';
import { IRanking } from '../typings';

interface ICard extends IRanking {
    stakeToRanking: (rank: number, name: string) => void;
    isStaker: boolean;
    withdrawStake: (id: number) => void;
}

const Card: React.FC<ICard> = ({
    id,
    rank,
    name,
    netWorth,
    country,
    imgUrl,
    isLoading,
    classes,
    stakeToRanking,
    isStaker,
    withdrawStake,
    startingRank
}: ICard) => {
    return (
        <div className={'card__element card__element--' + classes}>
            <div className={'card__element--ready'}>
                <div className={'card__element__rank'}>
                    {startingRank > rank && <span className={'card__element__rank--increased'}>↑</span>}No. {rank}
                    {startingRank < rank && <span className={'card__element__rank--decreased'}>↓</span>}
                </div>
                <img className="card__element__photo" src={imgUrl} alt={'...'} />
                <div className={'card__element-info'}>
                    <div className={'card__element-info--name'}>{name}</div>
                    <div className={'card__element-info--net-worth'}>
                        <span style={{ fontSize: '14px' }}>Net Worth</span>
                        <br />
                        <span style={{ color: '#52b788' }}>{'$' + +netWorth / 1000 + ' B'}</span>
                    </div>
                    <div className={'card__element-info--country'}>{country}</div>
                </div>
            </div>
            {!isStaker && (
                <div className={'card__element__stake-button'}>
                    <button onClick={() => stakeToRanking(rank, name)}>Stake</button>
                </div>
            )}
            {isStaker && (
                <div className={'card__element__withdraw-button'}>
                    <button onClick={() => withdrawStake(id)}>Withdraw</button>
                </div>
            )}
        </div>
    );
};

export default Card;
