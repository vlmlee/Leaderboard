import React from "react";

interface PageIndices {
    pages: number;
}

export default function PageIndices({pages = 10}: PageIndices) {

    return <div>
        { Array.from({length: pages}, (_, index) => <a>{index}</a>) }
    </div>;
}
