import React, { useEffect, useState } from 'react';
import './stylesheets/App.scss';
import { NavLink, Outlet } from 'react-router-dom';
import { ethers } from 'ethers';

import LeaderboardAddress from './contractsData/Leaderboard-address.json';
import LeaderboardAbi from './contractsData/Leaderboard.json';
import { useFindPath } from './hooks/useFindPath';
import Modal from './components/Modal';
import { IWeb3Context } from './typings';
import { useCountdown } from './hooks/useCountDown';

export const Web3Context = React.createContext<any>({
    account: null,
    contract: {},
    etherPriceUSD: 0
});

function App() {
    const activeStyle = {
        textDecoration: 'underline',
        fontWeight: 600
    };

    const isHomePage = useFindPath() === '/';

    const [{ account, contract, etherPriceUSD }, setContext] = useState<IWeb3Context>({
        account: null,
        contract: {},
        etherPriceUSD: 0
    });
    const [isModalOpen, setModalState] = useState<boolean>(false);
    const [days, hours, minutes, seconds] = useCountdown(new Date('11/11/2023'));

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

    const allocateRewards = () => {
        setModalState(true);
        // do stuff
    };

    useEffect(() => {
        fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH', { mode: 'cors', method: 'GET' })
            .then(res => {
                return res.json();
            })
            .then(json => {
                setContext(prev => {
                    return {
                        ...prev,
                        etherPriceUSD: parseFloat(json.data.rates['USD']).toFixed(2)
                    };
                });
            });
    }, []);

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
                        <button className="App__header__allocate-rewards" onClick={allocateRewards}>
                            Allocate Rewards
                        </button>
                    </>
                )}
                {!account && (
                    <button className="App__header__connect-wallet" onClick={web3Handler}>
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
                    <div className={'App__staking-countdown__warning'}>Staking ends in:</div>
                    <div className={'App__staking-countdown__timer'}>
                        {days}:{hours < 10 && '0'}
                        {hours}:{minutes < 10 && '0'}
                        {minutes}:{seconds < 10 && '0'}
                        {seconds}
                    </div>
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
            <Web3Context.Provider value={[{ contract, account, etherPriceUSD }, setContext]}>
                <Outlet />
            </Web3Context.Provider>
            {isModalOpen && (
                <Modal closeModal={() => setModalState(false)}>
                    <div>
                        <div>You are about to end this leaderboard contract.</div>
                        <div>Are you sure you want to continue?</div>
                        <div>
                            <button>Yes</button>
                            <button onClick={() => setModalState(false)}>No</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default App;
