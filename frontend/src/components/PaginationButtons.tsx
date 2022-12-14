import React from 'react';
import '../stylesheets/PaginationButtons.scss';

export default function PaginationButtons({
    paginate,
    currentPage,
    resultsLength,
    maxLength,
    isLoading
}: {
    paginate: Function;
    currentPage: number;
    resultsLength: number;
    maxLength: number;
    isLoading: boolean;
}) {
    return (
        <div className={'pagination-button'}>
            {resultsLength > 1 ? (
                <div className={'pagination-button__indices'}>
                    <span>
                        {currentPage * 5 + 1}-
                        {resultsLength > currentPage * 5 + 5 ? currentPage * 5 + 5 : resultsLength > 1 && resultsLength}{' '}
                        {resultsLength > 5 && <>of {maxLength || ''}</>}
                    </span>
                </div>
            ) : null}

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
                        (currentPage * 5 + 5 < resultsLength && !isLoading
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
