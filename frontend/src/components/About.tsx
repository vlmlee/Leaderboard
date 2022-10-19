import React from 'react';
import '../stylesheets/AboutPage.scss';

export default function About() {
    return (
        <div className={'about-page info-sections'}>
            <div className={'about-page__content info-sections__content'}>
                This app is just one example of what you can do with a Leaderboard smart contract. The design was
                inspired (slightly) by <a href={'https://curve.fi/4pool'}>4pool</a>.
                <br />
                <br />
                Come see the source code on <a href={'https://github.com/vlmlee/Leaderboard'}>github</a>.
            </div>
        </div>
    );
}
