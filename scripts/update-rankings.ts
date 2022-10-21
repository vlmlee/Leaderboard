const ethers = require('ethers');

const WordleAddress = require('../frontend/src/contractsData/Leaderboard-address.json');
const WordleABI = require('../frontend/src/contractsData/Leaderboard.json');

async function randomlySwapRanks() {
    let provider, wallet;

    provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    // hardhat account #0
    wallet = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, provider);

    // provider = new ethers.providers.JsonRpcProvider(`${process.env.INFURA_URL + process.env.INFURA_API_KEY}`);
    // wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);

    const instance = new ethers.Contract(WordleAddress.address, WordleABI.abi, wallet);

    const randomRanksArray = generateArrayOfRandomNumbers();

    for (let i = 0; i < randomRanksArray.length; i = i + 2) {
        const updateRankingTx = await instance.swapRank(
            randomRanksArray[i] - 1,
            randomRanksArray[i],
            randomRanksArray[i + 1] - 1,
            randomRanksArray[i + 1]
        );
    }
}

function generateArrayOfRandomNumbers() {
    return Array.from({ length: 30 }, () => Math.ceil(Math.random() * 100));
}
