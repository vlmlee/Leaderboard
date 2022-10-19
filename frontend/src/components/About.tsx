import React from 'react';
import '../stylesheets/AboutPage.scss';

export default function About() {
    return (
        <div className={'about-page info-sections'}>
            <div className={'about-page__content info-sections__content'}>
                <div>This app is just one example of what you can do with a Leaderboard smart contract.</div>
                <br />
                Come see the source code on <a href={'https://github.com/vlmlee/Leaderboard'}>github</a>.
            </div>
        </div>
    );
}
