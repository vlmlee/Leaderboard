const ethers = require('ethers');

const LeaderboardAddress = require('../frontend/src/contractsData/Leaderboard-address.json');
const LeaderboardABI = require('../frontend/src/contractsData/Leaderboard.json');

const { sleep } = require('./helpers.ts');

async function randomlySwapRanks() {
    let provider, wallet;

    // provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    // // hardhat account #0
    // wallet = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, provider);

    provider = new ethers.providers.JsonRpcProvider(`${process.env.INFURA_URL + process.env.INFURA_API_KEY}`);
    wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);

    const instance = new ethers.Contract(LeaderboardAddress.address, LeaderboardABI.abi, wallet);

    const randomRanksArray = generateArrayOfRandomNumbers();

    for (let i = 0; i < randomRanksArray.length; i = i + 2) {
        if (randomRanksArray[i] !== randomRanksArray[i + 1]) {
            const rankingFrom = await instance.getRankingById(randomRanksArray[i]);
            const rankingTo = await instance.getRankingById(randomRanksArray[i + 1]);

            const updateRankingTx = await instance.swapRank(
                rankingFrom.id,
                rankingFrom.rank,
                rankingTo.id,
                rankingTo.rank,
                {
                    gasLimit: 30000000
                }
            );
            await updateRankingTx.wait();
            await sleep(() => {
                console.log('Delay for 0.25 second.');
            });
            console.log('Swapping rank ', randomRanksArray[i], ' and rank ', randomRanksArray[i + 1]);
        }
    }
}

function generateArrayOfRandomNumbers() {
    return Array.from({ length: 30 }, () => Math.ceil(Math.random() * 98 + 1));
}

randomlySwapRanks()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.log('Error: ', err);
        process.exit(0);
    });
