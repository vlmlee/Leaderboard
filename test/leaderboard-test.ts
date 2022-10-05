// @ts-ignore
import {ethers} from "hardhat";
import {Signer} from "ethers";
import {assert, expect} from "chai";
import {loadFixture} from "ethereum-waffle";

describe("Leaderboard", function () {
    async function deployFixture() {
        const Leaderboard = await ethers.getContractFactory("Leaderboard");
        const [facilitator, addr1, addr2] = await ethers.getSigners();

        const leaderboard = await Leaderboard.deploy( ethers.utils.formatBytes32String("Leaderboard"), new Date("12/12/2022").getTime());
        await leaderboard.deployed();

        await leaderboard.addRanking(1, ethers.utils.formatBytes32String( "Elon Musk"), []);
        await leaderboard.addRanking(2, ethers.utils.formatBytes32String( "Jeff Bezos"), []);

        return { Leaderboard, leaderboard, facilitator, addr1, addr2 };
    }

    describe("Deployment", async function () {

        it("should set the facilitator correctly", async function () {
            const {leaderboard, facilitator} = await loadFixture(deployFixture);
            expect(await leaderboard.facilitator()).to.equal(facilitator.address);
        });
    });

    describe("Get rankings", async function () {
        it("should get a ranking given an id", async function () {

        });
    });

    describe("Add rankings", async function () {
        it("should create a new ranking", async function () {
            const {leaderboard, facilitator} = await loadFixture(deployFixture);

            // check size
            // check currentId
        });

        it("should emit RankingAdded event when a new ranking is created", async function () {

        });

        it("should revert if a name is not provided when adding a new ranking", async function () {

        });

        it("should revert if a zero ranking is provided when adding a new ranking", async function () {

        });

        it("should not allow any address other than the facilitator to add a new ranking", async function () {

        });

        it("should allow arbitrary data in the data field", async function () {

        });
    });

    describe("Delete rankings", async function () {
        it("should delete a ranking", async function () {

        });

        it("should emit RankingRemoved event when a ranking is deleted", async function () {

        });

        it("should return stakes if there are any for the removed ranking", async function () {

        });
    });

    describe("Update rankings", async function () {
        it("should modify a ranking", async function () {

        });

    });

    describe("Add stakes", async function() {
        it("should increase the reward pool when a new stake is added", async function () {

        });
    });

    describe("Withdraw stakes", async function() {

    });

    describe("Allocate rewards", async function() {

    });

    describe("Destroy contract", async function() {
        it("should return all stakes to their respective addresses", async function () {

        });
    });
});
