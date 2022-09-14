import React from "react";
import { Ranking } from "./ListContainer";
import "./List.scss";

export default function List({rank, name, netWorth, country, imgUrl}: Ranking) {
    return <div className={"list-element"}>
        <div>{rank}</div>
        <div>{name}</div>
        <div>{netWorth}</div>
        <div>{country}</div>
        <img src={imgUrl} />
        <div>stake</div>
    </div>;
}
