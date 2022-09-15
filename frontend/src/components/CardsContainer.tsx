import React from "react";
import Card from "./Card";
import "./CardsContainer.scss";
import {chunk} from "lodash";
import {Ranking} from "./ListContainer";

export default function CardsContainer() {
    const rankings: Array<Ranking> = [
        {
            rank: 1,
            name: "Elon Musk",
            netWorth: "$219 B",
            country: "USA",
            imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/220px-Elon_Musk_Royal_Society_%28crop2%29.jpg"
        },
        {
            rank: 2,
            name: "Jeff Bezos",
            netWorth: "$171 B",
            country: "USA",
            imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29_%28cropped%29.jpg/220px-Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29_%28cropped%29.jpg"
        },
        {
            rank: 3,
            name: "Bernard Arnault",
            netWorth: "$151 B",
            country: "France",
            imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bernard_Arnault_%283%29_-_2017_%28cropped%29.jpg/220px-Bernard_Arnault_%283%29_-_2017_%28cropped%29.jpg"
        },
        {
            rank: 4,
            name: "Bill Gates",
            netWorth: "$129 B",
            country: "USA",
            imgUrl: ""
        },
        {
            rank: 5,
            name: "Warren Buffet",
            netWorth: "$118 B",
            country: "USA",
            imgUrl: ""
        },
        {
            rank: 6,
            name: "Larry Page",
            netWorth: "$111 B",
            country: "USA",
            imgUrl: ""
        },
        {
            rank: 7,
            name: "Sergey Brin",
            netWorth: "$107 B",
            country: "USA",
            imgUrl: ""
        },
        {
            rank: 8,
            name: "Larry Ellison",
            netWorth: "$106 B",
            country: "USA",
            imgUrl: ""
        },
        {
            rank: 9,
            name: "Steve Ballmer",
            netWorth: "$91.4 B",
            country: "USA",
            imgUrl: ""
        },
        {
            rank: 10,
            name: "Mukesh Ambani",
            netWorth: "$90.7 B",
            country: "India",
            imgUrl: ""
        }
    ];

    const generateBoxes = (numOfBoxes: number) => {
        const boxes: any = [];
        for (let i = 0; i < numOfBoxes; i++) {
            boxes.push(<div className={"box-push-left"}></div>);
        }
        return boxes;
    }

    const generateCards = () => {
        const rankingsChunk = chunk(rankings, 4);
        const arr: any = [];
        rankingsChunk.forEach((group: Array<Ranking>, i: number) => {
            arr.push(
                <div key={i} className={"group-container"}>
                    <>
                        {group.map((ranking: Ranking, j: number) =>
                            <Card key={j}
                                  rank={ranking.rank}
                                  name={ranking.name}
                                  netWorth={ranking.netWorth}
                                  country={ranking.country}
                                  imgUrl={ranking.imgUrl}/>)}
                        {group.length < 4 ? generateBoxes(4 - group.length) : null}
                    </>
                </div>);

        });
        return arr;
    }

    return <div className={"card-container"}>
        {generateCards()}
    </div>;
}
