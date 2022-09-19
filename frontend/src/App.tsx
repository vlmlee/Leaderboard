import React from 'react';
import './stylesheets/App.scss';
import {NavLink, Outlet} from "react-router-dom";

function App() {
    const activeStyle = {
        textDecoration: "underline",
        fontWeight: 600
    };

    return (
        <div className="App">
            <header className="App-header">
                <nav>
                    <ul>
                        <li>
                            <NavLink to={"/compact"}
                                     style={({isActive}) =>
                                         isActive ? activeStyle : undefined
                                     }>Compact</NavLink>
                        </li>
                        <li>
                            <NavLink to={"/expanded"}
                                     style={({isActive}) =>
                                         isActive ? activeStyle : undefined
                                     }>Expanded</NavLink>
                        </li>
                        <li>
                            <NavLink to={"/charts"}
                                     style={({isActive}) =>
                                         isActive ? activeStyle : undefined
                                     }>Charts</NavLink>
                        </li>
                        <li>
                            <NavLink to={"/about"}
                                     style={({isActive}) =>
                                         isActive ? activeStyle : undefined
                                     }>About</NavLink>
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
