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
    withdrawStake
}: ICard) => {
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
                            <span style={{ color: '#52b788' }}>{'$' + +netWorth / 1000 + ' B'}</span>
                        </div>
                        <div className={'card__element-info--country'}>{country}</div>
                    </div>
                </div>
            )}
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
