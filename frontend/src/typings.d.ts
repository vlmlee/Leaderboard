export type IRanking = {
    id: number;
    rank: number;
    name: string;
    netWorth: string;
    country: string;
    imgUrl: string;
    isLoading?: boolean;
    stakers?: number;
    classes?: string;
};

export interface IPageIndices {
    pages: number;
}

export interface IWeb3Context {
    account: any;
    contract: any;
    etherPriceUSD?: number | string;
    rankings: any[];
    stakes: any[];
}
