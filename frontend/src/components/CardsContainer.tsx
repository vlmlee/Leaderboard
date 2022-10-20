import React, { useContext, useState } from 'react';
import Card from './Card';
import '../stylesheets/CardsContainer.scss';
import { chunk } from 'lodash';
import { IRanking } from '../typings';
import SearchBar from './SearchBar';
import PageIndices from './PageIndices';
import { Web3Context } from '../App';
import Modal from './Modal';
import { INITIAL_SELECTED_RANK } from '../helpers/Constants';

export default function CardsContainer() {
    const [{ rankings, contract, etherPriceUSD }, setContext] = useContext<any>(Web3Context);
    // const [rankings, setRankings] = useState<IRanking[]>(DEFAULT_RANKINGS);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setModalState] = useState(false);
    const [selectedRank, setSelectedRank] = useState<IRanking>(INITIAL_SELECTED_RANK);

    const generateBoxes = (numOfBoxes: number) => {
        const boxes: any = [];
        for (let i = 0; i < numOfBoxes; i++) {
            boxes.push(<div id={`generated-box-${i}`} className={'box-push-left'}></div>);
        }
        return boxes;
    };

    const stakeToRanking = (rank: number, name: string) => {
        setModalState(true);
        const _selectedRank = rankings.find((_ranking: IRanking) => _ranking.name === name && _ranking.rank === rank);

        setSelectedRank(_selectedRank ?? INITIAL_SELECTED_RANK);
    };

    const generateCards = () => {
        const rankingsChunk = chunk(rankings, 4);
        const arr: JSX.Element[] = [];
        rankingsChunk.forEach((group: any, i: number) => {
            arr.push(
                <div key={`card__container__group-${i}`} className={'card__container__group'}>
                    <>
                        {group.map((ranking: IRanking, j: number) => (
                            <Card
                                key={`card-${j}`}
                                id={ranking.id}
                                classes={j % 2 === 0 ? 'blue' : 'red'}
                                isLoading={isLoading}
                                rank={ranking.rank}
                                name={ranking.name}
                                netWorth={ranking.netWorth}
                                country={ranking.country}
                                imgUrl={ranking.imgUrl}
                                stakeToRanking={stakeToRanking}
                            />
                        ))}
                        {group.length < 4 ? generateBoxes(4 - group.length) : null}
                    </>
                </div>
            );
        });
        return arr;
    };

    const filterResults = (searchTerm: string) => {
        // if (searchTerm !== '') {
        //     setRankings((state: IRanking[]) => {
        //         return DEFAULT_RANKINGS.filter((ranking: IRanking) => ranking.name.toLowerCase().includes(searchTerm));
        //     });
        // } else {
        //     setRankings((state: IRanking[]) => DEFAULT_RANKINGS);
        // }
    };

    const closeModal = () => {
        setModalState(false);
    };

    return (
        <div className={'card__container'}>
            <div className={'search-bar-container'}>
                <SearchBar filterResults={filterResults} />
            </div>
            <PageIndices pages={Math.ceil(rankings.length / 20)} />
            {generateCards()}
            {isModalOpen && (
                <Modal closeModal={closeModal}>
                    <div>
                        <div className={'modal__title'}>Stake to {selectedRank.name}</div>
                        <div className={'modal__description'}>
                            <div>
                                You are attempting to stake to {selectedRank.name}, who is currently ranked #
                                {selectedRank.rank}.
                            </div>
                            <div className={'modal__description__are-you-sure'}>Are you sure you want to continue?</div>
                            <div className={'modal__description__fee-notice'}>
                                Notice: There is a 0.0025 ETH (${(+etherPriceUSD * 0.0025).toFixed(2)}) commission fee.
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
