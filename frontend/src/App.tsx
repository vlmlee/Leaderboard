import React, {useState} from 'react';
import './stylesheets/App.scss';
import {NavLink, Outlet} from "react-router-dom";
import { ethers } from "ethers";

import LeaderboardAddress from "./contractsData/Leaderboard-address.json";
import LeaderboardAbi from "./contractsData/Leaderboard.json";

function App() {
    const activeStyle = {
        textDecoration: "underline",
        fontWeight: 600
    };

    const _window: any = window;
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState({});

    const web3Handler = async () => {
        const accounts = await _window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new ethers.providers.Web3Provider(_window.ethereum);
        const signer = provider.getSigner();
        await loadContract(signer);
    };

    const loadContract = async (signer: any) => {
        const _contract = new ethers.Contract(LeaderboardAddress.address, LeaderboardAbi.abi, signer);
        setContract(_contract);
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
            {account ? <a href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer">{account}</a>
            : <button onClick={web3Handler}>Connect Wallet</button>}
            <Outlet/>
        </div>
    );
}

export default App;
