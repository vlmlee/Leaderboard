import React, { useCallback, useEffect, useState } from 'react';
import './stylesheets/App.scss';
import { NavLink, Outlet } from 'react-router-dom';
import { ethers } from 'ethers';

import LeaderboardAddress from './contractsData/Leaderboard-address.json';
import LeaderboardAbi from './contractsData/Leaderboard.json';
import { useFindPath } from './hooks/useFindPath';
import Modal from './components/Modal';
import { IWeb3Context } from './typings';
import convertToRanking from './helpers/convertToRanking';
import CountDownTimer from './components/CountDownTimer';

export const Web3Context = React.createContext<any>({
    account: null,
    contract: {},
    etherPriceUSD: 0,
    rankings: [],
    stakes: [],
    maxLength: 100,
    isFacilitator: false,
    provider: {},
    gasPrice: 0,
    gasLimit: 0,
    maxFeePerGas: 0
});

function App() {
    const activeStyle = {
        textDecoration: 'underline',
        fontWeight: 600
    };

    const isHomePage = useFindPath() === '/';

    const [
        {
            provider,
            account,
            contract,
            etherPriceUSD,
            rankings,
            stakes,
            maxLength,
            isFacilitator,
            gasPrice,
            gasLimit,
            maxFeePerGas
        },
        setContext
    ] = useState<IWeb3Context>({
        account: null,
        contract: {},
        provider: {},
        etherPriceUSD: 0,
        rankings: [],
        stakes: [],
        maxLength: 100,
        isFacilitator: false,
        gasPrice: 0,
        gasLimit: 0,
        maxFeePerGas: 0
    });
    const [isModalOpen, setModalState] = useState<boolean>(false);
    const [endTime, setEndTime] = useState<Date>(new Date(''));
    const [acceptedRisk, setAcceptedRisk] = useState(false);
    const [errors, setErrors] = useState({
        errorAllocatingStakes: false,
        noStakesAddedYet: false
    });

    const web3Handler = async () => {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setContext(prev => ({
            ...prev,
            account: accounts[0]
        }));

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);

        const signer = provider.getSigner();
        await loadContract(signer, provider, accounts[0]);
    };

    const loadContract = async (signer: any, _provider: any, account: string) => {
        const _contract = new ethers.Contract(LeaderboardAddress.address, LeaderboardAbi.abi, signer);

        const endTime = await _contract.endTime();
        setEndTime(endTime.toNumber());

        let _ranks: any = [];

        for (let i = 1; i < 21; i++) {
            const _rankings = await _contract.getRankingByRank(i);
            _ranks.push(convertToRanking(_rankings));
        }

        const _stakes = await _contract.getUserStakes();
        const facilitator = await _contract.facilitator();

        const feeData = await _provider.getFeeData();

        setContext(prev => ({
            ...prev,
            gasPrice: +ethers.utils.formatUnits(feeData.gasPrice, 'wei'),
            gasLimit: 15000000,
            maxFeePerGas: +ethers.utils.formatUnits(feeData.maxFeePerGas, 'wei'),
            provider: _provider,
            contract: _contract,
            rankings: _ranks,
            stakes: _stakes,
            isFacilitator: facilitator.toLowerCase() === account.toLowerCase()
        }));
    };

    const closeModal = () => {
        setModalState(false);
        setAcceptedRisk(false);
        setErrors((prev: any) => {
            return {
                errorAllocatingStakes: false,
                noStakesAddedYet: false
            };
        });
    };

    const acceptRisk = () => {
        setModalState(true);
        setAcceptedRisk(true);
    };

    const allocateRewards = useCallback(async () => {
        try {
            const allocateRewardsTx = await contract.allocateRewards();
            const allocateRewardsTxReceipt = await allocateRewardsTx.wait();

            const stakes = await contract.getUserStakes();

            setContext((prev: any) => {
                return {
                    ...prev,
                    stakes: stakes
                };
            });

            closeModal();
        } catch (err) {
            if (stakes.length === 0) {
                setErrors(prev => ({
                    ...prev,
                    noStakesAddedYet: true
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    errorAllocatingStakes: true
                }));
            }
        }
    }, [contract]);

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
                        {isFacilitator && (
                            <button className="App__header__allocate-rewards" onClick={() => setModalState(true)}>
                                Allocate Rewards
                            </button>
                        )}
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
                <CountDownTimer endTime={endTime} />
            </header>
            {account && (
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
            )}
            {!account && <div className={'shimmer App__connect-message'}>Connect to your wallet to get started</div>}
            {account && (
                <Web3Context.Provider
                    value={[
                        {
                            provider,
                            contract,
                            account,
                            etherPriceUSD,
                            rankings,
                            stakes,
                            maxLength,
                            isFacilitator,
                            gasPrice,
                            gasLimit,
                            maxFeePerGas
                        },
                        setContext
                    ]}>
                    <Outlet />
                </Web3Context.Provider>
            )}
            {isModalOpen && (
                <Modal
                    closeModal={closeModal}
                    onAccept={() => {
                        acceptedRisk ? allocateRewards() : acceptRisk();
                    }}
                    altText={acceptedRisk ? 'allocate' : 'yes'}>
                    <div>
                        <div className={'modal__title'}>Ending Contract</div>
                        {!acceptedRisk && (
                            <div className={'modal__description'}>
                                <div>
                                    You are about to end this leaderboard. Terminating this contract will allocate all
                                    rewards to stakers and cause it to self-destruct.
                                </div>
                                <div className={'modal__description__are-you-sure'}>
                                    Are you sure you want to continue?
                                </div>
                            </div>
                        )}
                        {acceptedRisk && (
                            <div className={'modal__description'}>
                                <div>You may allocate rewards now.</div>
                            </div>
                        )}
                        {errors && errors.errorAllocatingStakes && (
                            <div className={'modal__error--already-staked'}>
                                Something went wrong. Please try again.
                            </div>
                        )}
                        {errors && errors.noStakesAddedYet && (
                            <div className={'modal__error--already-staked'}>
                                No stakes added yet. Cannot allocate rewards.
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default App;
