import React, { useState } from 'react';
import List from './ListRow';
import '../stylesheets/ListContainer.scss';
import SearchBar from './SearchBar';
import PaginationButtons from './PaginationButtons';
import { defaultRankings } from '../helpers/Constants';

export type Ranking = {
    rank: number;
    name: string;
    netWorth: string;
    country: string;
    imgUrl: string;
    isLoading?: boolean;
    stakers?: number;
};

export default function ListContainer() {
    const [rankings, setRankings] = useState(defaultRankings);
    const [currentPage, setCurrentPage] = useState(0);

    const generateList = () => {
        const arr: any = [];
        rankings.slice(currentPage * 5, currentPage * 5 + 5).forEach((ranking: Ranking, i: number) => {
            arr.push(
                <List
                    key={i}
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
            return defaultRankings.filter((ranking: Ranking) => ranking.name.toLowerCase().includes(searchTerm));
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
                        <span className={'list__header--element--stake'}>Stake</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--num'}>Number of Stakers</span>
                    </div>
                </div>
                {generateList()}
            </div>
            <PaginationButtons paginate={paginate} currentPage={currentPage} resultsLength={rankings.length} />
        </div>
    );
}
