import React, { useCallback, useContext, useEffect, useState } from 'react';
import Card from './Card';
import '../stylesheets/CardsContainer.scss';
import { chunk, isEmpty } from 'lodash';
import { IRanking } from '../typings';
import SearchBar from './SearchBar';
import PageIndices from './PageIndices';
import { Web3Context } from '../App';
import Modal from './Modal';
import { INITIAL_SELECTED_RANK } from '../helpers/Constants';
import convertToRanking from '../helpers/convertToRanking';
import { BigNumber, ethers } from 'ethers';

export default function CardsContainer() {
    const [
        { account, rankings, contract, etherPriceUSD, maxLength, gasPrice, gasLimit, stakes, minimumStake },
        setContext
    ] = useContext<any>(Web3Context);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setModalState] = useState(false);
    const [selectedRank, setSelectedRank] = useState<IRanking>(INITIAL_SELECTED_RANK);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [{ currentFilterTerm, filteredRankings, filterLength }, setFilters] = useState<{
        currentFilterTerm: string;
        filteredRankings: IRanking[];
        filterLength: number;
    }>({
        currentFilterTerm: '',
        filterLength: 0,
        filteredRankings: []
    });
    const [acceptedRisk, setAcceptedRisk] = useState(false);
    const [amountToStake, setAmountToStake] = useState<string>('0');
    const [errors, setErrors] = useState({
        userHasAlreadyStaked: false,
        errorWithdrawingStake: false
    });
    const [isStaking, setIsStaking] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const isBeingFiltered = currentFilterTerm !== '';

    const generateBoxes = (numOfBoxes: number) => {
        const boxes: any = [];
        for (let i = 0; i < numOfBoxes; i++) {
            boxes.push(<div key={`generated-box-${i}`} className={'box-push-left'}></div>);
        }
        return boxes;
    };

    const openStakeModal = (rank: number, name: string) => {
        setIsStaking(true);
        setModalState(true);
        const _selectedRank = rankings.find((_ranking: IRanking) => _ranking.name === name && _ranking.rank === rank);

        setSelectedRank(_selectedRank ?? INITIAL_SELECTED_RANK);
    };

    const openWithdrawModal = (id: number) => {
        setIsWithdrawing(true);
        setModalState(true);
        const _selectedRank = rankings.find((_ranking: IRanking) => _ranking.id === id);

        setSelectedRank(_selectedRank ?? INITIAL_SELECTED_RANK);
    };

    const generateCards = () => {
        const _rankings = isBeingFiltered ? filteredRankings : rankings;

        const rankingsChunk = chunk(_rankings.slice(currentPage * 20, currentPage * 20 + 20), 4);
        const arr: JSX.Element[] = [];
        rankingsChunk.forEach((group: any, i: number) => {
            arr.push(
                <div key={`card__container__group-${i}`} className={'card__container__group'}>
                    <>
                        {group.map((ranking: IRanking, j: number) => {
                            const _stakes = stakes.filter((s: any) => s[1] === ranking.id);
                            let isStaker = false;
                            if (_stakes.length) {
                                isStaker =
                                    _stakes.findIndex(
                                        (_stake: any) => _stake[0].toLowerCase() === account.toLowerCase()
                                    ) > -1;
                            }

                            return (
                                <Card
                                    key={`card-${j}`}
                                    id={ranking.id}
                                    classes={j % 2 === 0 ? 'blue' : 'red'}
                                    isLoading={isLoading}
                                    rank={ranking.rank}
                                    startingRank={ranking.startingRank}
                                    name={ranking.name}
                                    netWorth={ranking.netWorth}
                                    country={ranking.country}
                                    imgUrl={ranking.imgUrl}
                                    isStaker={isStaker}
                                    stakeToRanking={openStakeModal}
                                    withdrawStake={openWithdrawModal}
                                />
                            );
                        })}
                        {group.length < 4 ? generateBoxes(4 - group.length) : null}
                    </>
                </div>
            );
        });
        return arr;
    };

    const filterResults = (searchTerm: string) => {
        const filteredRankings = rankings.filter((ranking: IRanking) => {
            return ranking.name.toLowerCase().includes(searchTerm);
        });

        const filterLength = filteredRankings.length;
        setFilters(() => ({
            currentFilterTerm: searchTerm,
            filterLength: filterLength,
            filteredRankings: filteredRankings
        }));
        setCurrentPage(0);
    };

    const closeModal = () => {
        setModalState(false);
        setAcceptedRisk(false);
        setIsStaking(false);
        setIsWithdrawing(false);
        setIsLoading(false);
        setErrors(() => {
            return {
                userHasAlreadyStaked: false,
                errorWithdrawingStake: false
            };
        });
    };

    const addStake = useCallback(
        async (_selectedRank: IRanking) => {
            try {
                if (isStaking) {
                    setIsLoading(true);
                    const addStakeTx = await contract.addStake(
                        _selectedRank.id,
                        ethers.utils.formatBytes32String(_selectedRank.name),
                        {
                            value: BigNumber.from(ethers.utils.parseEther(amountToStake)).add(
                                ethers.utils.parseEther('0.0025')
                            ),
                            gasLimit: gasLimit,
                            gasPrice: gasPrice
                        }
                    );
                    const addStakeTxReceipt = await addStakeTx.wait();

                    const stakes = await contract.getUserStakes();

                    setContext((prev: any) => {
                        return {
                            ...prev,
                            stakes: stakes
                        };
                    });
                }

                await closeModal();
            } catch (err) {
                setErrors(prev => {
                    return {
                        ...errors,
                        userHasAlreadyStaked: true
                    };
                });
            }
        },
        [amountToStake, isStaking]
    );

    const withdrawStake = useCallback(
        async (_selectedRank: IRanking) => {
            try {
                if (isWithdrawing) {
                    setIsLoading(true);

                    const withdrawStakeTx = await contract.withdrawStake(account, _selectedRank.id);
                    await withdrawStakeTx.wait();

                    const stakes = await contract.getUserStakes();

                    setContext((prev: any) => {
                        return {
                            ...prev,
                            stakes: stakes
                        };
                    });
                }
                closeModal();
            } catch (err) {
                setErrors((prev: any) => {
                    return {
                        ...prev,
                        errorWithdrawingStake: true
                    };
                });
            }
        },
        [isWithdrawing]
    );

    const acceptRisk = () => {
        setAcceptedRisk(true);
    };

    useEffect(() => {
        async function retrieveSectionRankings() {
            if (!isEmpty(contract) && currentFilterTerm === '') {
                const indicesToRetrieve = currentPage * 20 + 1;
                const isRankingAlreadyAdded = rankings.findIndex((r: IRanking) => r.rank === indicesToRetrieve) !== -1;

                if (!isRankingAlreadyAdded && indicesToRetrieve < maxLength) {
                    let _rankings: any[] = [];
                    setIsLoading(true);
                    for (let i = rankings.length; i < indicesToRetrieve + 20; i++) {
                        const _ranks = await contract.getRankingByRank(i);
                        _rankings.push(convertToRanking(_ranks));
                    }

                    const onlyUnique = (_rank: any, index: number, self: any) => {
                        return self.findIndex((_r: any) => _r.id === _rank.id) === index;
                    };

                    return rankings.concat(_rankings).filter(onlyUnique); // make sure we don't duplicate from the list side
                }
            }
        }

        retrieveSectionRankings().then(newRankings => {
            if (newRankings && newRankings.length) {
                setContext((prev: any) => {
                    return {
                        ...prev,
                        rankings: newRankings
                    };
                });
                setIsLoading(false);
            }
        });
    }, [currentPage]);

    return (
        <div className={'card__container'}>
            <div className={'search-bar-container'}>
                <SearchBar filterResults={filterResults} />
            </div>
            <PageIndices
                currentPage={currentPage}
                pages={isBeingFiltered ? Math.ceil(filteredRankings.length / 20) : 5}
                setCurrentPage={setCurrentPage}
            />
            {isLoading && (
                <div className={'spinner__container'}>
                    <div className="Spinner SpinnerDotsScale">
                        <div className="spinner-dot"></div>
                        <div className="spinner-dot"></div>
                        <div className="spinner-dot"></div>
                    </div>
                </div>
            )}
            {generateCards()}
            {!isLoading && (
                <PageIndices
                    currentPage={currentPage}
                    pages={isBeingFiltered ? Math.ceil(filteredRankings.length / 20) : 5}
                    setCurrentPage={setCurrentPage}
                />
            )}
            {isModalOpen && (
                <Modal
                    closeModal={closeModal}
                    onAccept={() =>
                        acceptedRisk ? (isStaking ? addStake(selectedRank) : withdrawStake(selectedRank)) : acceptRisk()
                    }
                    altText={acceptedRisk ? (isStaking ? 'stake' : 'withdraw') : ''}>
                    <>
                        {isStaking && (
                            <div>
                                <div className={'modal__title'}>Stake to {selectedRank.name}</div>
                                <div className={'modal__description'}>
                                    {!acceptedRisk && (
                                        <>
                                            <div>
                                                You are attempting to stake to {selectedRank.name}, who is currently
                                                ranked #{selectedRank.rank}. The minimum amount you can stake is{' '}
                                                {minimumStake} ETH.
                                            </div>
                                            <div className={'modal__description__are-you-sure'}>
                                                Are you sure you want to continue?
                                            </div>
                                            <div className={'modal__description__fee-notice'}>
                                                Notice: There is a 0.0025 ETH (${(+etherPriceUSD * 0.0025).toFixed(2)})
                                                commission fee.
                                            </div>
                                        </>
                                    )}
                                    {acceptedRisk && (
                                        <>
                                            <div>Select an amount to stake to {selectedRank.name} (in ETH).</div>
                                            <input
                                                className={'modal__description__input'}
                                                type="number"
                                                onChange={e => setAmountToStake(e.target.value)}
                                            />
                                        </>
                                    )}
                                    {errors && errors.userHasAlreadyStaked && (
                                        <div className={'modal__error--already-staked'}>
                                            Something went wrong. Please try again.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {isWithdrawing && (
                            <div>
                                <div className={'modal__title'}>Withdraw Stake from {selectedRank.name}</div>
                                <div className={'modal__description'}>
                                    {!acceptedRisk && (
                                        <>
                                            <div>
                                                You are attempting to withdraw your stake from {selectedRank.name}, who
                                                is currently ranked #{selectedRank.rank}. The minimum amount you can
                                                stake is {minimumStake}ETH.
                                            </div>
                                            <div className={'modal__description__are-you-sure'}>
                                                Are you sure you want to continue?
                                            </div>
                                        </>
                                    )}
                                    {acceptedRisk && (
                                        <>
                                            <div>You may withdraw your stake now.</div>
                                            <br />
                                            <div>There is no commission fee for withdrawing.</div>
                                        </>
                                    )}
                                    {errors && errors.errorWithdrawingStake && (
                                        <div className={'modal__error--already-staked'}>
                                            Something went wrong. Please try again.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                </Modal>
            )}
        </div>
    );
}
