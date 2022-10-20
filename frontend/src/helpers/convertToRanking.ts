import { IRanking } from '../typings';
import { ethers } from 'ethers';

export default function convertToRanking(_ranking: any): IRanking {
    const _data = ethers.utils.arrayify(_ranking.data);
    const data = new TextDecoder().decode(_data);
    const dataObj = JSON.parse(data);

    let imgUrl = '';
    if (!dataObj?.imgUrl?.startsWith('https:')) imgUrl = 'https:' + dataObj.imgUrl;
    else imgUrl = dataObj.imgUrl;

    return {
        id: _ranking.id,
        rank: _ranking.rank,
        name: ethers.utils.parseBytes32String(_ranking.name),
        imgUrl: imgUrl,
        netWorth: dataObj.netWorth,
        country: dataObj.country
    };
}
