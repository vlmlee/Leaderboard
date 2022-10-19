import { IRanking } from '../typings';

export const DEFAULT_RANKINGS: Array<IRanking> = [
    {
        rank: 1,
        name: 'Elon Musk',
        netWorth: '$219 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 2,
        name: 'Jeff Bezos',
        netWorth: '$171 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 3,
        name: 'Bernard Arnault',
        netWorth: '$151 B',
        country: 'France',
        imgUrl: ''
    },
    {
        rank: 4,
        name: 'Bill Gates',
        netWorth: '$129 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 5,
        name: 'Warren Buffet',
        netWorth: '$118 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 6,
        name: 'Larry Page',
        netWorth: '$111 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 7,
        name: 'Sergey Brin',
        netWorth: '$107 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 8,
        name: 'Larry Ellison',
        netWorth: '$106 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 9,
        name: 'Steve Ballmer',
        netWorth: '$91.4 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        rank: 10,
        name: 'Mukesh Ambani',
        netWorth: '$90.7 B',
        country: 'India',
        imgUrl: ''
    }
];

export const INITIAL_SELECTED_RANK = {
    name: '',
    rank: 0,
    netWorth: '',
    country: '',
    imgUrl: '',
    isLoading: false,
    stakers: 0
};

export default {
    DEFAULT_RANKINGS,
    INITIAL_SELECTED_RANK
};
