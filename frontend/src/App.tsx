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
                    <>
                        <a
                            className="App__header__connect-wallet"
                            href={`https://etherscan.io/address/${account}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            <span className={'App__header__connect-wallet__emoji'}>🔗</span>Address:{' '}
                            {account?.slice(0, 8)}...
                            {account?.slice(account.length - 4)}
                        </a>
                        <button className="App__header__allocate-rewards button" onClick={web3Handler}>
                            Allocate Rewards
                        </button>
                    </>
                )}
                {!account && (
                    <button className="App__header__connect-wallet button" onClick={web3Handler}>
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
                            <NavLink to={'/rewards'} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                Rewards
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'/about'} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                About
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <NavLink className={'App__header__logo'} to={'/'}>
                    DeLeaderboards
                </NavLink>
                <div className={'App__staking-countdown'}>
                    <div className={'App__staking-countdown__warning'}>Staking Ends In:</div>
                    <div className={'App__staking-countdown__timer'}>00:00:00</div>
                </div>
            </header>
            <div className={'App__title'}>
                <h1>
                    <div className={'emoji__container'} role={'img'}>
                        <div className={'emoji'}>💸</div>
                        <div className={'emoji'}>🏆</div>
                        <div className={'emoji'}>💵</div>
                    </div>{' '}
                    World's Richest People{' '}
                    <div className={'emoji__container'} role={'img'}>
                        <div className={'emoji'}>💵</div>
                        <div className={'emoji'}>🏆</div>
                        <div className={'emoji'}>💸</div>
                    </div>
                </h1>
                <h2>by Forbes</h2>
            </div>
            <Web3Context.Provider value={[{ contract, account }, setContext]}>
                <Outlet />
            </Web3Context.Provider>
        </div>
    );
}

export default App;
