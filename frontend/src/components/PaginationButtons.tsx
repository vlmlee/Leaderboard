import React from 'react';
import '../stylesheets/PaginationButtons.scss';

export default function PaginationButtons({
    paginate,
    currentPage,
    resultsLength
}: {
    paginate: Function;
    currentPage: number;
    resultsLength: number;
}) {
    return (
        <div className={'pagination-button'}>
            <div className={'index-of'}>
                <span>
                    {resultsLength ? currentPage * 5 + 1 : 0}-
                    {resultsLength > currentPage * 5 + 5 ? currentPage * 5 + 5 : resultsLength} of {resultsLength}
                </span>
            </div>
            <div className={'buttons'}>
                <div
                    className={currentPage > 0 ? 'active' : 'disabled'}
                    onClick={() => (currentPage > 0 ? paginate(currentPage - 1) : null)}>
                    ← Previous
                </div>
                <div
                    className={currentPage * 5 + 5 < resultsLength ? 'active' : 'disabled'}
                    onClick={() => (currentPage * 5 + 5 < resultsLength ? paginate(currentPage + 1) : null)}>
                    Next →
                </div>
            </div>
        </div>
    );
}
