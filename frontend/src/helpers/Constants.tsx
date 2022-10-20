import { IRanking } from '../typings';

export const DEFAULT_RANKINGS: Array<IRanking> = [
    {
        id: 0,
        rank: 1,
        name: 'Elon Musk',
        netWorth: '$219 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 1,
        rank: 2,
        name: 'Jeff Bezos',
        netWorth: '$171 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 2,
        rank: 3,
        name: 'Bernard Arnault',
        netWorth: '$151 B',
        country: 'France',
        imgUrl: ''
    },
    {
        id: 3,
        rank: 4,
        name: 'Bill Gates',
        netWorth: '$129 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 4,
        rank: 5,
        name: 'Warren Buffet',
        netWorth: '$118 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 5,
        rank: 6,
        name: 'Larry Page',
        netWorth: '$111 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 6,
        rank: 7,
        name: 'Sergey Brin',
        netWorth: '$107 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 7,
        rank: 8,
        name: 'Larry Ellison',
        netWorth: '$106 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 8,
        rank: 9,
        name: 'Steve Ballmer',
        netWorth: '$91.4 B',
        country: 'USA',
        imgUrl: ''
    },
    {
        id: 9,
        rank: 10,
        name: 'Mukesh Ambani',
        netWorth: '$90.7 B',
        country: 'India',
        imgUrl: ''
    }
];

export const INITIAL_SELECTED_RANK = {
    id: 0,
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
