const ethers = require('ethers');

const LeaderboardAddress = require('../frontend/src/contractsData/Leaderboard-address.json');
const LeaderboardABI = require('../frontend/src/contractsData/Leaderboard.json');
const axios = require('axios');
const forbesListJSON = require('./forbes-2022.json');

require('dotenv').config();

const { sleep } = require('./helpers.ts');

async function prepareContract() {
    let provider, wallet;

    provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    // hardhat account #0
    wallet = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, provider);

    // provider = new ethers.providers.JsonRpcProvider(`${process.env.INFURA_URL + process.env.INFURA_API_KEY}`);
    // wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);

    const instance = new ethers.Contract(LeaderboardAddress.address, LeaderboardABI.abi, wallet);

    const rankings = await rankingsData();

    for (let i = 0; i < rankings.length; i++) {
        const addRankingTx = await instance.addRanking(rankings[i].rank, rankings[i].name, rankings[i].data, {
            gasLimit: 30000000
        });
        const addRankingTxReceipt = await addRankingTx.wait();
        console.log(
            `Added ranking ${rankings[i].rank}:${rankings[i].name} with txHash:`,
            addRankingTxReceipt.transactionHash
        );
        console.log('Waiting for transaction to mine.');
        await sleep(() => {
            console.log('Delay for 60 second. Change this if you are running a local node.');
        });
    }

    console.log('Done.');
}

async function rankingsData() {
    return forbesListJSON.personLists.map(person => {
        const _name =
            person.firstName.length > 16
                ? person.firstName[0] + '. ' + person.lastName
                : person.firstName + ' ' + person.lastName;

        const name = ethers.utils.formatBytes32String(_name);
        const rank = person.position;
        const dataObj = {
            imgUrl: person.squareImage,
            netWorth: person.finalWorth,
            country: person.country
        };
        const data = ethers.utils.hexlify(Buffer.from(JSON.stringify(dataObj)));

        return {
            name,
            rank,
            data
        };
    });
}

prepareContract()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.log('Error: ', err);
        process.exit(0);
    });
