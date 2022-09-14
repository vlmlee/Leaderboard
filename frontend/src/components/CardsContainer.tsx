import React from "react";
import Card from "./Card";
import "./CardsContainer.scss";

export default function CardsContainer() {
    return <div className={"card-container"}>
        Expanded
        <Card />
    </div>;
}
