import React from 'react';
import { useCountdown } from '../hooks/useCountDown';

const CountDownTimer = ({ endTime }: any) => {
    const [days, hours, minutes, seconds] = useCountdown(endTime);

    return (
        <div>
            {!isNaN(days) && (
                <div className={'App__staking-countdown fade-in'}>
                    <div className={'App__staking-countdown__warning'}>Staking ends in:</div>
                    <div className={'App__staking-countdown__timer'}>
                        {days}:{hours < 10 && '0'}
                        {hours}:{minutes < 10 && '0'}
                        {minutes}:{seconds < 10 && '0'}
                        {seconds}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountDownTimer;
