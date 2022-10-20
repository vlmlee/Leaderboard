import React, { useContext, useEffect, useState } from 'react';
import '../stylesheets/Rewards.scss';
import { Web3Context } from '../App';
import { ethers } from 'ethers';
import { isEmpty } from 'lodash';

const Rewards = ({}) => {
    const [{ contract }] = useContext(Web3Context);
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

    return (
        <div className={'rewards info-sections'}>
            <div className={'rewards__content info-sections__content'}>
                <div>Current reward pool: {rewardPool && rewardPool + ' ETH'}</div>
                <div>Current payouts:</div>
            </div>
        </div>
    );
};

export default Rewards;
