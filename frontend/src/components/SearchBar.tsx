import React from "react";
import "./SearchBar.scss";

export default function SearchBar({filterResults}: any) {
    return <div className={"search-bar"}>
        <input placeholder={"Enter a name..."} onChange={(e: any) => filterResults(e.target.value)}/>
    </div>;
}
