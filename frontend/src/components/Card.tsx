import React from "react";
import "./Card.scss";
import {Ranking} from "./ListContainer";

const Card: React.FC<Ranking> = ({rank, name, netWorth, country, imgUrl}: Ranking) => {
    return <div className={"card-element"}>
        <div className={"rank"}>No. {rank}</div>
        <img className="photo" src={imgUrl}/>
        <div className={"info"}>
            <div className={"name"}>{name}</div>
            <div className={"net-worth"}><span style={{fontSize: '14px'}}>Net Worth</span><br /><span style={{color: '#52b788'}}>{netWorth}</span></div>
            <div className={"country"}>{country}</div>
        </div>
    </div>
};

export default Card;
