import React, { useContext, useState } from 'react';
import ListRow from './ListRow';
import '../stylesheets/ListContainer.scss';
import SearchBar from './SearchBar';
import PaginationButtons from './PaginationButtons';
import { DEFAULT_RANKINGS, INITIAL_SELECTED_RANK } from '../helpers/Constants';
import { IRanking } from '../typings';
import Modal from './Modal';
import { Web3Context } from '../App';

export default function ListContainer() {
    const [rankings, setRankings] = useState(DEFAULT_RANKINGS);
    const [currentPage, setCurrentPage] = useState(0);
    const [isModalOpen, setModalState] = useState(false);
    const [selectedRank, setSelectedRank] = useState<IRanking>({
        name: '',
        rank: 0,
        netWorth: '',
        country: '',
        imgUrl: '',
        classes: ''
    });

    const [{ etherPriceUSD }] = useContext(Web3Context);

    const generateList = () => {
        const arr: any = [];
        rankings.slice(currentPage * 5, currentPage * 5 + 5).forEach((ranking: IRanking, i: number) => {
            arr.push(
                <ListRow
                    key={`list__element-${i}`}
                    rank={ranking.rank}
                    name={ranking.name}
                    netWorth={ranking.netWorth}
                    country={ranking.country}
                    imgUrl={ranking.imgUrl}
                    stakeToRanking={stakeToRanking}
                />
            );
        });
        return arr;
    };

    const filterResults = (searchTerm: string) => {
        setRankings(state => {
            return DEFAULT_RANKINGS.filter((ranking: IRanking) => ranking.name.toLowerCase().includes(searchTerm));
        });
    };

    const paginate = (page: number) => {
        setCurrentPage(page);
    };

    const stakeToRanking = (rank: number, name: string) => {
        setModalState(true);
        const _selectedRank = rankings.find((_ranking: IRanking) => _ranking.name === name && _ranking.rank === rank);

        setSelectedRank(_selectedRank ?? INITIAL_SELECTED_RANK);
    };

    const closeModal = (state: boolean) => {
        setModalState(state);
    };

    return (
        <div className={'list__container'}>
            <SearchBar filterResults={filterResults} />
            <div className={'list'}>
                <div className={'list__header'}>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--rank'}>Rank</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--name'}>Name</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--net-worth'}>Net Worth</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--country'}>Country</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--stake'}>Already Staked?</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--num'}>Number of Stakers</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--total-value-locked'}>Total Value Locked</span>
                    </div>
                </div>
                {generateList()}
            </div>
            <div className={'App__fee-notice'}>
                <div>The commission fee for staking is: 0.0025 ETH (${(+etherPriceUSD * 0.0025).toFixed(2)})</div>
            </div>
            <PaginationButtons paginate={paginate} currentPage={currentPage} resultsLength={rankings.length} />
            {isModalOpen && (
                <Modal closeModal={closeModal}>
                    <div>
                        <div>
                            You are attempting to stake to {selectedRank.name}, ranked {selectedRank.rank}.
                        </div>
                        <div>Are you sure you want to stake? There is a 0.0025 ETH commission fee.</div>
                        <div>
                            <button onClick={() => {}}>yes</button>
                            <button onClick={() => setModalState(false)}>cancel</button>
                        </div>
                    </div>
                </Modal>
            )}
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
}
