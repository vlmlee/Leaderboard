import React from 'react';
import { AxisOptions, Chart as BarChart, Datum, DatumFocusStatus } from 'react-charts';
import forbes2026 from '../../data/forbes-2026.json';
import '../../stylesheets/Charts.scss';

type ChartDatum = {
    name: string;
    finalNetWorth: number;
    rank: number;
};

type ChartTooltipProps = {
    focusedDatum: { originalDatum: ChartDatum } | null;
};

const formatBillions = (value: number) => `$${(value / 1000).toFixed(2)} B`;

function ChartTooltip({ focusedDatum }: ChartTooltipProps) {
    if (!focusedDatum) {
        return null;
    }

    const { name, finalNetWorth, rank } = focusedDatum.originalDatum;

    return (
        <div className={'charts__tooltip'}>
            <div className={'charts__tooltip-rank'}>No. {rank}</div>
            <div className={'charts__tooltip-name'}>{name}</div>
            <div className={'charts__tooltip-worth'}>{formatBillions(finalNetWorth)}</div>
        </div>
    );
}

export default function Chart() {
    const data = React.useMemo(
        () => [
            {
                label: 'Net Worth',
                data: forbes2026.map(person => ({
                    name: person.name,
                    finalNetWorth: person.finalWorth,
                    rank: person.rank
                }))
            }
        ],
        []
    );

    const primaryAxis = React.useMemo(
        (): AxisOptions<ChartDatum> => ({
            getValue: datum => datum.name,
            scaleType: 'band',
            tickLabelRotationDeg: -55,
            minTickPaddingForRotation: 0,
            showGrid: false,
            innerBandPadding: 0.18,
            outerBandPadding: 0.08
        }),
        []
    );

    const secondaryAxes = React.useMemo(
        (): AxisOptions<ChartDatum>[] => [
            {
                getValue: datum => datum.finalNetWorth,
                elementType: 'bar',
                formatters: {
                    scale: formatBillions,
                    tooltip: formatBillions
                }
            }
        ],
        []
    );

    const getSeriesStyle = React.useCallback(
        () => ({
            rectangle: {
                fill: 'url(#charts-bar-fill)'
            }
        }),
        []
    );

    const getDatumStyle = React.useCallback((_datum: Datum<ChartDatum>, status: DatumFocusStatus) => {
        return {
            opacity: status === 'none' ? 0.82 : 1
        };
    }, []);

    const renderSVG = React.useCallback(
        () => (
            <defs>
                <linearGradient id={'charts-bar-fill'} x1={'0'} y1={'1'} x2={'0'} y2={'0'}>
                    <stop offset={'0%'} stopColor={'#5851db'} />
                    <stop offset={'55%'} stopColor={'#833ab4'} />
                    <stop offset={'100%'} stopColor={'#c13584'} />
                </linearGradient>
            </defs>
        ),
        []
    );

    const tooltip = React.useMemo(
        () => ({
            groupingMode: 'single' as const,
            render: ({ focusedDatum }: ChartTooltipProps) => <ChartTooltip focusedDatum={focusedDatum} />
        }),
        []
    );

    return (
        <div className={'charts info-sections fade-in'}>
            <div className={'charts__content info-sections__content'}>
                <h3 className={'charts__title'}>Forbes 2026 Net Worth</h3>
                <p className={'charts__subtitle'}>Top 100 richest people</p>
                <div className={'charts__plot'}>
                    <BarChart
                        options={{
                            data,
                            primaryAxis,
                            secondaryAxes,
                            defaultColors: ['#5851db'],
                            padding: {
                                left: 4,
                                right: 12,
                                top: 12,
                                bottom: 72
                            },
                            getSeriesStyle,
                            getDatumStyle,
                            renderSVG,
                            tooltip,
                            primaryCursor: false,
                            secondaryCursor: false,
                            interactionMode: 'closest'
                        }}
                    />
                </div>
            </div>
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee{' '}
                    <span role={'img'} aria-label={'eyes'}>
                        👀
                    </span>
                </a>{' '}
            </footer>
        </div>
    );
}
