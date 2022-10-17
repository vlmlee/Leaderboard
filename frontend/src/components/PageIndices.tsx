import React from 'react';
import '../stylesheets/PageIndices.scss';

interface PageIndices {
    pages: number;
}

export default function PageIndices({ pages = 10 }: PageIndices) {
    return (
        <div className={'page-indices'}>
            {Array.from({ length: pages }, (_, index) => (
                <p className={'page'}>{index + 1}</p>
            ))}
        </div>
    );
}
