// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');
const { artifacts, ethers } = require('hardhat');
const path = require('path');

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const Leaderboard = await hre.ethers.getContractFactory('Leaderboard');
    const leaderboard = await Leaderboard.deploy(
        ethers.utils.formatBytes32String('Leaderboard'),
        new Date('12/12/2022').getTime(),
        ethers.utils.parseEther('0.0025'),
        {
            value: ethers.utils.parseEther('2.0'),
            gasPrice: 8000000000,
            gasLimit: 10000000
        }
    );

    await leaderboard.deployed();

    console.log('Leaderboard deployed to:', leaderboard.address);

    saveFrontendFiles(leaderboard, 'Leaderboard');
}

function saveFrontendFiles(contract, name) {
    const fs = require('fs');
    const contractsDir = path.resolve('..') + '/leaderboard/frontend/src/contractsData';

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + `/${name}-address.json`,
        JSON.stringify({ address: contract.address }, undefined, 2)
    );

    const contractArtifact = artifacts.readArtifactSync(name);

    fs.writeFileSync(contractsDir + `/${name}.json`, JSON.stringify(contractArtifact, null, 2));
    console.log(
        'Contract artifacts saved at:',
        contractsDir + `/${name}-address.json`,
        ' and ',
        contractsDir + `/${name}.json`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

module.exports = main;
