export type IRanking = {
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
