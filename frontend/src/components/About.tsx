import React from 'react';
import '../stylesheets/AboutPage.scss';

export default function About() {
    return (
        <div className={'about-page info-sections'}>
            <div className={'about-page__content info-sections__content'}>
                Take part in betting on who will gain ranks in the Forbes rankings of the richest people in the world.
                <br />
                <br />
                This app is just one example of what you can build with a Leaderboard smart contract. The design was
                inspired (slightly) by <a href={'https://curve.fi/4pool'}>4pool</a>.
                <br />
                <br />
                Come see the source code on <a href={'https://github.com/vlmlee/Leaderboard'}>github</a>.
            </div>
            <footer className={'App__credit'}>
                <a className={'App__credit-link'} href={'https://www.mlee.app'}>
                    -created by mlee <span>👀</span>
                </a>{' '}
            </footer>
        </div>
    );
}
