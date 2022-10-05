// @ts-ignore
import {ethers} from "hardhat";
import {Signer} from "ethers";
import {assert} from "chai";

describe("Token", function () {
    let accounts: Signer[];

    beforeEach(async function () {
        accounts = await ethers.getSigners();
    });

    it("should have accounts", async function () {
        assert(accounts.length > 0, "Account length should be more then zero");
    });
});

describe("Leaderboard", function () {

});
