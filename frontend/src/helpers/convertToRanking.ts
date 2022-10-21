import { IRanking } from '../typings';
import { ethers } from 'ethers';

export default function convertToRanking(_ranking: any): IRanking {
    const _data = ethers.utils.arrayify(_ranking.data);
    const data = new TextDecoder().decode(_data);
    const dataObj = JSON.parse(data);

    let imgUrl = '';
    if (dataObj && dataObj.imgUrl === undefined) {
        imgUrl =
            'https://specials-images.forbesimg.com/imageserve/6050f48ca1ab099ed6e290cc/416x416.jpg?background=000000&amp;cropX1=0&amp;cropX2=800&amp;cropY1=0&amp;cropY2=800';
    } else if (!dataObj?.imgUrl?.startsWith('https:')) {
        imgUrl = 'https:' + dataObj.imgUrl;
    } else imgUrl = dataObj.imgUrl;

    return {
        id: _ranking.id,
        rank: _ranking.rank,
        startingRank: _ranking.startingRank,
        name: ethers.utils.parseBytes32String(_ranking.name),
        imgUrl: imgUrl,
        netWorth: dataObj.netWorth,
        country: dataObj.country
    };
}
