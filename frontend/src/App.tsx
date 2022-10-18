import React, { useState } from 'react';
import './stylesheets/App.scss';
import { NavLink, Outlet } from 'react-router-dom';
import { ethers } from 'ethers';

import LeaderboardAddress from './contractsData/Leaderboard-address.json';
import LeaderboardAbi from './contractsData/Leaderboard.json';
import { useFindPath } from './hooks/useFindPath';

export const Web3Context = React.createContext<any>({});

function App() {
    const activeStyle = {
        textDecoration: 'underline',
        fontWeight: 600
    };

    const isHomePage = useFindPath() === '/';

    const [{ account, contract }, setContext] = useState<{ account: any; contract: any }>({
        account: null,
        contract: {}
    });

    const web3Handler = async () => {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setContext(prev => ({
            ...prev,
            account: accounts[0]
        }));

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        await loadContract(signer);
    };

    const loadContract = async (signer: any) => {
        const _contract = new ethers.Contract(LeaderboardAddress.address, LeaderboardAbi.abi, signer);
        setContext(prev => ({
            ...prev,
            contract: _contract
        }));
    };

    return (
        <div className="App">
            <header className="App__header">
                {account && (
                    <a
                        className="connect-wallet"
                        href={`https://etherscan.io/address/${account}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        Address: {account?.slice(0, 8)}...{account?.slice(account.length - 4)}
                    </a>
                )}
                {!account && (
                    <button className="connect-wallet" onClick={web3Handler}>
                        Connect Wallet
                    </button>
                )}
                <nav>
                    <ul>
                        <li>
                            <NavLink
                                to={'/compact'}
                                style={({ isActive }) => {
                                    return isHomePage || isActive ? activeStyle : undefined;
                                }}>
                                Compact
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/expanded'} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                Expanded
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/charts'} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                Charts
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/about'} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                About
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className={'App__title'}>
                <h1>World's Richest People</h1>
                <h2>by Forbes</h2>
            </div>
            <Web3Context.Provider value={[{ contract, account }, setContext]}>
                <Outlet />
            </Web3Context.Provider>
        </div>
    );
}

export default App;
