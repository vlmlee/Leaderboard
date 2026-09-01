import React from 'react';
import '../stylesheets/SearchBar.scss';

export default function SearchBar({ filterResults }: any) {
    return (
        <div className={'search-bar'}>
            <input placeholder={'Search by name'} onChange={(e: any) => filterResults(e.target.value)} />
        </div>
    );
}
