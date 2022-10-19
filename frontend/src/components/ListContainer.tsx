import React, { useState } from 'react';
import ListRow from './ListRow';
import '../stylesheets/ListContainer.scss';
import SearchBar from './SearchBar';
import PaginationButtons from './PaginationButtons';
import { defaultRankings } from '../helpers/Constants';
import { IRanking } from '../typings';

export default function ListContainer() {
    const [rankings, setRankings] = useState(defaultRankings);
    const [currentPage, setCurrentPage] = useState(0);

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
                />
            );
        });
        return arr;
    };

    const filterResults = (searchTerm: string) => {
        setRankings(state => {
            return defaultRankings.filter((ranking: IRanking) => ranking.name.toLowerCase().includes(searchTerm));
        });
    };

    const paginate = (page: number) => {
        setCurrentPage(page);
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
            <PaginationButtons paginate={paginate} currentPage={currentPage} resultsLength={rankings.length} />
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://github.com/vlmlee'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
}
