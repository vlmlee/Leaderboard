import React, { useEffect, useState } from 'react';
import Card from './Card';
import '../stylesheets/CardsContainer.scss';
import { chunk } from 'lodash';
import { IRanking } from '../typings';
import SearchBar from './SearchBar';
import getPhoto from '../helpers/getPhoto';
import PageIndices from './PageIndices';
import { defaultRankings } from '../helpers/Constants';

export default function CardsContainer() {
    const [rankings, setRankings] = useState(defaultRankings);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        Promise.all(rankings.map((r: any) => getPhoto(r.name))).then(res => {
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
    }, [rankings]);

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
                        {group.map((ranking: IRanking, j: number) => (
                            <Card
                                key={j}
                                classes={j % 2 === 0 ? 'blue' : 'red'}
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
                return defaultRankings.filter((ranking: IRanking) => ranking.name.toLowerCase().includes(searchTerm));
            });
        } else {
            setRankings((state: any) => defaultRankings);
        }
    };

    return (
        <div className={'card__container'}>
            <div className={'search-bar-container'}>
                <SearchBar filterResults={filterResults} />
            </div>
            <PageIndices pages={Math.ceil(rankings.length / 20)} />
            {generateCards()}
        </div>
    );
}
