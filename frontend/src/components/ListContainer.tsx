import React, { useCallback, useContext, useEffect, useState } from 'react';
import ListRow from './ListRow';
import '../stylesheets/ListContainer.scss';
import SearchBar from './SearchBar';
import PaginationButtons from './PaginationButtons';
import { INITIAL_SELECTED_RANK } from '../helpers/Constants';
import { IListFilter, IRanking } from '../typings';
import Modal from './Modal';
import { Web3Context } from '../App';
import convertToRanking from '../helpers/convertToRanking';
import { isEmpty } from 'lodash';
import { BigNumber, ethers } from 'ethers';

export default function ListContainer() {
    const [{ contract, stakes, rankings, maxLength, etherPriceUSD, gasLimit, gasPrice }, setContext] =
        useContext<any>(Web3Context);
    const [{ currentFilterTerm, filteredRankings, filterLength }, setFilter] = useState<IListFilter>({
        currentFilterTerm: '',
        filterLength: 0,
        filteredRankings: []
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [isModalOpen, setModalState] = useState(false);
    const [selectedRank, setSelectedRank] = useState<IRanking>(INITIAL_SELECTED_RANK);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedRisk, setAcceptedRisk] = useState(false);
    const [amountToStake, setAmountToStake] = useState<string>('0');
    const [errors, setErrors] = useState({
        userHasAlreadyStaked: false
    });

    const isBeingFiltered = currentFilterTerm !== '';

    useEffect(() => {
        async function retrieveNextPageRankings() {
            if (!isEmpty(contract) && currentFilterTerm === '') {
                // Check next page index and what rankings are supposed to be there
                const rankingsIndexToCheck = currentPage * 5 + 6;

                // If it is greater than the current length of the rankings, then fetch those
                // rankings from the smart contract unless the rankings are above the max length
                // defined.
                if (rankingsIndexToCheck >= rankings.length && rankingsIndexToCheck < maxLength) {
                    let _rankings: any[] = [];
                    setIsLoading(true);
                    // Get the next 5 rankings
                    for (let i = rankingsIndexToCheck; i < rankingsIndexToCheck + 5; i++) {
                        const _ranks = await contract.getRankingByRank(i);
                        _rankings.push(convertToRanking(_ranks));
                    }

                    return rankings.concat(_rankings);
                }
            }
        }

        retrieveNextPageRankings().then(newRankings => {
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

    const generateList = () => {
        const arr: any = [];
        const _rankings = isBeingFiltered ? filteredRankings : rankings;

        _rankings.slice(currentPage * 5, currentPage * 5 + 5).forEach((ranking: IRanking, i: number) => {
            const _stakes = stakes.filter((s: any[]) => s[1] === ranking.id);
            const stakers = _stakes.length;
            let liquidity = 0;

            if (stakers) {
                liquidity = _stakes.reduce((acc: number, cur: any) => {
                    acc = acc + +ethers.utils.formatEther(cur[3]);
                    return acc;
                }, 0);
            }

            arr.push(
                <ListRow
                    key={`list__element-${i}`}
                    id={ranking.id}
                    rank={ranking.rank}
                    name={ranking.name}
                    netWorth={ranking.netWorth}
                    country={ranking.country}
                    imgUrl={ranking.imgUrl}
                    liquidity={liquidity}
                    stakers={stakers || '0'}
                    stakeToRanking={stakeToRanking}
                />
            );
        });
        return arr;
    };

    const filterResults = (searchTerm: string) => {
        const filteredRankings = rankings.filter((ranking: IRanking) => {
            return ranking.name.toLowerCase().includes(currentFilterTerm);
        });

        const filterLength = filteredRankings.length;
        setFilter(() => ({
            currentFilterTerm: searchTerm,
            filterLength: filterLength,
            filteredRankings: filteredRankings
        }));
        setCurrentPage(0);
    };

    const paginate = (page: number) => {
        setCurrentPage(page);
    };

    const stakeToRanking = (rank: number, name: string) => {
        setModalState(true);
        const _selectedRank = rankings.find((_ranking: IRanking) => _ranking.name === name && _ranking.rank === rank);

        setSelectedRank(_selectedRank ?? INITIAL_SELECTED_RANK);
    };

    const closeModal = () => {
        setModalState(false);
        setAcceptedRisk(false);
        setErrors(() => {
            return {
                userHasAlreadyStaked: false
            };
        });
    };

    const acceptRisk = () => {
        setAcceptedRisk(true);
    };

    const addStake = useCallback(
        async (_selectedRank: IRanking) => {
            try {
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
        [amountToStake]
    );

    return (
        <div className={'list__container'}>
            <SearchBar filterResults={filterResults} />
            <div className={'list'}>
                <div className={'list__header'}>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--rank'}>Rank</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--name'}>Name</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--net-worth'}>Net Worth</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--country'}>Country</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--stake'}>Already Staked?</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--num'}>Number of Stakers</span>
                    </div>
                    <div className={'list__header--element'}>
                        <span className={'list__header--element--total-value-locked'}>Total Value Locked</span>
                    </div>
                </div>
                {generateList()}
            </div>
            <div className={'App__fee-notice'}>
                <div>The commission fee for staking is: 0.0025 ETH (${(+etherPriceUSD * 0.0025).toFixed(2)})</div>
            </div>
            <PaginationButtons
                paginate={paginate}
                currentPage={currentPage}
                resultsLength={isBeingFiltered ? filterLength : rankings.length}
                isLoading={isLoading}
                maxLength={isBeingFiltered ? filterLength : maxLength}
            />
            {isModalOpen && (
                <Modal
                    closeModal={closeModal}
                    onAccept={() => (acceptedRisk ? addStake(selectedRank) : acceptRisk())}
                    altText={acceptedRisk ? 'stake' : ''}>
                    <div>
                        <div className={'modal__title'}>Stake to {selectedRank.name}</div>
                        <div className={'modal__description'}>
                            {!acceptedRisk && (
                                <>
                                    <div>
                                        You are attempting to stake to {selectedRank.name}, who is currently ranked #
                                        {selectedRank.rank}.
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
                                    You've already staked to {selectedRank.name}. Please unstake first or choose a
                                    different person.
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
}
