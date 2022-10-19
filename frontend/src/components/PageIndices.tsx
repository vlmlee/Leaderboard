import React from 'react';
import '../stylesheets/PageIndices.scss';
import { IPageIndices } from '../typings';

export default function PageIndices({ pages = 10 }: IPageIndices) {
    return (
        <div className={'page__indices'}>
            {Array.from({ length: pages }, (_, index) => (
                <p key={`page__indices-${index}`} className={'page'}>
                    {index + 1}
                </p>
            ))}
        </div>
    );
}
