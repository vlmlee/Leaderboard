# DeLeaderboard

Check it out live [here](https://master.d3g1nzgxr2hsak.amplifyapp.com/) on the Sepolia testnet.

## Running Locally

Adding rankings into this contract takes a lot of gas and confirmation blocks, so it is not advisable to run this
contract on a public testnet. To run locally, in the terminal use the npm scripts at the root of the project:

```shell
npm run node
npm run prepare-contract
npm run frontend
```

This will populate the smart contract with some rankings and start the React app that lets you interact with the
deployed contract. You will need Metamask or another wallet provider to use the app.

You can then run the npm script:

```shell
npm run update-rankings
```

To simulate ranking changes to see how players will receive rewards for staking.

## Tests

To run the hardhat+waffle+chai unit and integration tests, use:

```shell
npm test
```

## Disclaimer

This dApp has not been audited. **Be careful not to use real ETH when interacting with it.**