import React from 'react';
import '../stylesheets/PageIndices.scss';
import { IPageIndices } from '../typings';

export default function PageIndices({ currentPage, pages = 10, setCurrentPage }: IPageIndices) {
    return (
        <div className={'page__indices'}>
            {Array.from({ length: pages }, (_, index) => (
                <p
                    key={`page__indices-${index}`}
                    className={`page ${currentPage === index ? ' page--active' : ''}`}
                    onClick={() => setCurrentPage(index)}>
                    {index + 1}
                </p>
            ))}
        </div>
    );
}
