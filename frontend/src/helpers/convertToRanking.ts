import { IRanking } from '../typings';
import { ethers } from 'ethers';

export default function convertToRanking(_ranking: any): IRanking {
    const _data = ethers.utils.arrayify(_ranking.data);
    const data = new TextDecoder().decode(_data);
    const dataObj = JSON.parse(data);

    return {
        rank: _ranking.rank,
        name: ethers.utils.parseBytes32String(_ranking.name),
        imgUrl: 'https:' + dataObj.imgUrl,
        netWorth: dataObj.netWorth,
        country: dataObj.country
    };
}
