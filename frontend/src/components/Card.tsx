import React from "react";
import "./Card.scss";
import {Ranking} from "./ListContainer";

const Card: React.FC<Ranking> = ({rank, name, netWorth, country, imgUrl}: Ranking) => {
    return <div className={"card-element"}>
        <div>{rank}</div>
        <div>{name}</div>
        <div>{netWorth}</div>
        <div>{country}</div>
        <img src={imgUrl}/>
        <div>stake</div>
    </div>
};

export default Card;
