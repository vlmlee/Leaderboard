const ethers = require('ethers');

const LeaderboardAddress = require('../frontend/src/contractsData/Leaderboard-address.json');
const LeaderboardABI = require('../frontend/src/contractsData/Leaderboard.json');
const axios = require('axios');
const forbesListJSON = require('./forbes-2026.json');

require('dotenv').config();

const { sleep } = require('./helpers.ts');

function toBytes32Name(name) {
    const MAX = 31; // formatBytes32String needs a null terminator
    const bytes = Buffer.from(name, 'utf8');
    if (bytes.length <= MAX) {
        return ethers.utils.formatBytes32String(name);
    }

    let end = MAX;
    while (end > 0 && (bytes[end] & 0xc0) === 0x80) {
        end--; // back up so we don't split a UTF-8 character
    }
    return ethers.utils.formatBytes32String(bytes.subarray(0, end).toString('utf8'));
}

async function prepareContract() {
    let provider, wallet;

    provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    // hardhat account #0
    wallet = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, provider);

    // provider = new ethers.providers.JsonRpcProvider(`${process.env.INFURA_URL + process.env.INFURA_API_KEY}`);
    // wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);

    const instance = new ethers.Contract(LeaderboardAddress.address, LeaderboardABI.abi, wallet);
    const network = await provider.getNetwork();

    try {
        const facilitator = await instance.facilitator();
        console.log(
            `Using Leaderboard at ${instance.address} on chain ${network.chainId} (facilitator ${facilitator})`
        );
        if (facilitator.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(
                `Wallet ${wallet.address} is not the facilitator (${facilitator}). addRanking will revert.`
            );
        }
    } catch (err) {
        if (err.message && err.message.includes('not the facilitator')) {
            throw err;
        }
    }

    const existing = await instance.getAllRankings();
    const existingRanks = new Set(existing.filter(r => r.rank !== 0).map(r => r.rank));

    const rankings = await rankingsData();

    for (let i = 0; i < rankings.length; i++) {
        if (existingRanks.has(rankings[i].rank)) {
            console.log(`Skipping rank ${rankings[i].rank}: already exists`);
            continue;
        }

        const addRankingTx = await instance.addRanking(rankings[i].rank, rankings[i].name, rankings[i].data);
        const addRankingTxReceipt = await addRankingTx.wait();
        existingRanks.add(rankings[i].rank);
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
    return forbesListJSON.map(person => {
        const name = toBytes32Name(person.name);
        const rank = person.rank;
        const dataObj = {
            imgUrl: person.imageSrc,
            netWorth: person.finalWorth,
            country: person.countryOfCitizenship
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
