import React from 'react';
import {useState} from "react";
import './App.css';
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
                    </ul>
                </nav>
            </header>
            <Outlet/>
        </div>
    );
}

export default App;
