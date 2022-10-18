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
            <div className={'pagination-button__indices'}>
                <span>
                    {resultsLength ? currentPage * 5 + 1 : 0}-
                    {resultsLength > currentPage * 5 + 5 ? currentPage * 5 + 5 : resultsLength} of {resultsLength}
                </span>
            </div>
            <div className={'pagination-button__buttons'}>
                <div
                    className={
                        'pagination-button__buttons--previous ' +
                        (currentPage > 0
                            ? 'pagination-button__buttons--active'
                            : 'pagination-button__buttons--disabled')
                    }
                    onClick={() => (currentPage > 0 ? paginate(currentPage - 1) : null)}>
                    ← Previous
                </div>
                <div
                    className={
                        'pagination-button__buttons--next ' +
                        (currentPage * 5 + 5 < resultsLength
                            ? 'pagination-button__buttons--active'
                            : 'pagination-button__buttons--disabled')
                    }
                    onClick={() => (currentPage * 5 + 5 < resultsLength ? paginate(currentPage + 1) : null)}>
                    Next →
                </div>
            </div>
        </div>
    );
}
