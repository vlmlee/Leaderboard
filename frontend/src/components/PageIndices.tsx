import React from 'react';
import '../stylesheets/PageIndices.scss';
import { IPageIndices } from '../typings';

export default function PageIndices({ pages = 10 }: IPageIndices) {
    return (
        <div className={'page-indices'}>
            {Array.from({ length: pages }, (_, index) => (
                <p className={'page'}>{index + 1}</p>
            ))}
        </div>
    );
}
