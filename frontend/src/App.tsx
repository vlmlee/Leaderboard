import React from 'react';
import {useState} from "react";
import './App.scss';
import {Link, Outlet} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <nav>
                    <ul>
                        <li>
                            <Link to={"/compact"}>Compact</Link>
                        </li>
                        <li>
                            <Link to={"/expanded"}>Expanded</Link>
                        </li>
                        <li>
                            <Link to={"/charts"}>Charts</Link>
                        </li>
                        <li>
                            <Link to={"/about"}>About</Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <h1>World's Richest People</h1>
            <h2>by Forbes</h2>
            <Outlet/>
        </div>
    );
}

export default App;
