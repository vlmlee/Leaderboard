import React from "react";
import "./PageIndices.scss";

interface PageIndices {
    pages: number;
}

export default function PageIndices({pages = 10}: PageIndices) {

    return <div className={"page-indices"}>
        {Array.from({length: pages}, (_, index) => <a className={"page"}>{index + 1}</a>)}
    </div>;
}
