import React from 'react';
import LineChart from './LineChart';

export default function Chart() {
    // @ts-ignore
    const createLineChart = () =>
        LineChart(
            [
                { date: 1, close: 93.24 },
                { date: 2, close: 99.92 },
                { date: 3, close: 111.98 },
                { date: '2007-05-20', close: 111.98 }
            ],
            // @ts-ignore
            {
                x: (d: any) => d.date,
                y: (d: any) => d.close,
                yLabel: '↑ Daily close ($)',
                width: 1200,
                height: 500,
                color: 'steelblue'
            }
        );

    return (
        <div className={'charts info-sections'}>
            <div className={'charts__content info-sections__content'}>TODO</div>
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
}
