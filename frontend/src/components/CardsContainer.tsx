import React, { useEffect, useState } from 'react';
import Card from './Card';
import '../stylesheets/CardsContainer.scss';
import { chunk } from 'lodash';
import { Ranking } from './ListContainer';
import SearchBar from './SearchBar';
import getPhoto from '../helpers/getPhoto';
import PageIndices from './PageIndices';

export default function CardsContainer() {
    let initialRankings: Array<Ranking> = [
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

    const [rankings, setRankings] = useState(initialRankings);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        Promise.all(rankings.map((r: any) => getPhoto(r.name))).then((res) => {
            if (!isCancelled) {
                setRankings(
                    rankings.map((s: any, index: number) => {
                        return {
                            ...s,
                            imgUrl: res[index]
                        };
                    })
                );
            }
        });

        return () => {
            isCancelled = true;
        };
    }, []);

    const generateBoxes = (numOfBoxes: number) => {
        const boxes: any = [];
        for (let i = 0; i < numOfBoxes; i++) {
            boxes.push(<div className={'box-push-left'}></div>);
        }
        return boxes;
    };

    const generateCards = () => {
        const rankingsChunk = chunk(rankings, 4);
        const arr: any = [];
        // @ts-ignore
        rankingsChunk.forEach((group: Array<Ranking>, i: number) => {
            arr.push(
                <div key={i} className={'group-container'}>
                    <>
                        {group.map((ranking: Ranking, j: number) => (
                            <Card
                                key={j}
                                isLoading={isLoading}
                                rank={ranking.rank}
                                name={ranking.name}
                                netWorth={ranking.netWorth}
                                country={ranking.country}
                                imgUrl={ranking.imgUrl}
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
        if (searchTerm !== '') {
            setRankings((state: any) => {
                return initialRankings.filter((ranking: Ranking) => ranking.name.toLowerCase().includes(searchTerm));
            });
        } else {
            setRankings((state: any) => initialRankings);
        }
    };

    return (
        <div className={'card-container'}>
            <div className={'search-bar-container'}>
                <SearchBar filterResults={filterResults} />
            </div>
            <PageIndices pages={Math.ceil(rankings.length / 20)} />
            {generateCards()}
        </div>
    );
}
