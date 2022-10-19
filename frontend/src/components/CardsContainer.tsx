import React, { useEffect, useState } from 'react';
import Card from './Card';
import '../stylesheets/CardsContainer.scss';
import { chunk } from 'lodash';
import { IRanking } from '../typings';
import SearchBar from './SearchBar';
import getPhoto from '../helpers/getPhoto';
import PageIndices from './PageIndices';
import { DEFAULT_RANKINGS } from '../helpers/Constants';

export default function CardsContainer() {
    const [rankings, setRankings] = useState<IRanking[]>(DEFAULT_RANKINGS);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;
        Promise.all(rankings.map((r: IRanking) => getPhoto(r.name))).then(res => {
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
            boxes.push(<div id={`generated-box-${i}`} className={'box-push-left'}></div>);
        }
        return boxes;
    };

    const generateCards = () => {
        const rankingsChunk = chunk(rankings, 4);
        const arr: JSX.Element[] = [];
        rankingsChunk.forEach((group: Array<IRanking>, i: number) => {
            arr.push(
                <div key={`card__container__group-${i}`} className={'card__container__group'}>
                    <>
                        {group.map((ranking: IRanking, j: number) => (
                            <Card
                                key={`card-${j}`}
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
            setRankings((state: IRanking[]) => {
                return DEFAULT_RANKINGS.filter((ranking: IRanking) => ranking.name.toLowerCase().includes(searchTerm));
            });
        } else {
            setRankings((state: IRanking[]) => DEFAULT_RANKINGS);
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
