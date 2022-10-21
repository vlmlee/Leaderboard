import React, { useContext, useEffect, useState } from 'react';
import '../stylesheets/Rewards.scss';
import { Web3Context } from '../App';
import { ethers } from 'ethers';
import { isEmpty } from 'lodash';

const Rewards = ({}) => {
    const [{ contract, stakes, rankings }] = useContext(Web3Context);
    const [rewardPool, setRewardPool] = useState<string>('');

    useEffect(() => {
        async function getRewardPool() {
            if (!isEmpty(contract)) {
                const _rewardPool = await contract.rewardPool();
                setRewardPool(ethers.utils.formatEther(_rewardPool));
            }
        }

        getRewardPool();
    }, [contract]);

    const generateTableBody = () => {
        return <div></div>;
    };

    return (
        <div className={'rewards info-sections'}>
            <div className={'rewards__content info-sections__content'}>
                <div>Current reward pool: {rewardPool && rewardPool + ' ETH'}</div>
                <div>Current payouts:</div>
                <div className={'rewards__table-header'}>
                    <div>Address</div>
                    <div>Original Stake</div>
                    <div>Expected Reward</div>
                    <div>Percentage Gain/Loss</div>
                </div>
                <div className={'rewards__table-body'}>{generateTableBody()}</div>
            </div>
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
};

export default Rewards;
