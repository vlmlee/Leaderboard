import React, { useState } from 'react';
import List from './List';
import '../stylesheets/ListContainer.scss';
import SearchBar from './SearchBar';
import PaginationButtons from './PaginationButtons';

export type Ranking = {
    rank: number;
    name: string;
    netWorth: string;
    country: string;
    imgUrl: string;
    isLoading?: boolean;
};

const defaultRankings: Array<Ranking> = [
    {
        rank: 1,
        name: 'Elon Musk',
        netWorth: '$219 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 2,
        name: 'Jeff Bezos',
        netWorth: '$171 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 3,
        name: 'Bernard Arnault',
        netWorth: '$151 B',
        country: 'France',
        imgUrl: ''
    },
    {
        rank: 4,
        name: 'Bill Gates',
        netWorth: '$129 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 5,
        name: 'Warren Buffet',
        netWorth: '$118 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 6,
        name: 'Larry Page',
        netWorth: '$111 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 7,
        name: 'Sergey Brin',
        netWorth: '$107 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 8,
        name: 'Larry Ellison',
        netWorth: '$106 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 9,
        name: 'Steve Ballmer',
        netWorth: '$91.4 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 10,
        name: 'Mukesh Ambani',
        netWorth: '$90.7 B',
        country: 'India',
        imgUrl: ''
    }
];

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
        setRankings((state) => {
            return defaultRankings.filter((ranking: Ranking) => ranking.name.toLowerCase().includes(searchTerm));
        });
    };

    const paginate = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={'list-container'}>
            <SearchBar filterResults={filterResults} />
            <div className={'list'}>
                <div className={'header'}>
                    <div className={'rank'}>
                        <span>Rank</span>
                    </div>
                    <div>Name</div>
                    <div>Net Worth</div>
                    <div>Country</div>
                    <div></div>
                </div>
                {generateList()}
            </div>
            <PaginationButtons paginate={paginate} currentPage={currentPage} resultsLength={rankings.length} />
        </div>
    );
}
