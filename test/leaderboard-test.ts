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

        const testRankings = [
            {
                id: 0,
                rank: 1,
                name: ethers.utils.formatBytes32String( "Elon Musk"),
                data: [...Buffer.from("networth:232.4b")]
            },
            {
                id: 1,
                rank: 2,
                name:  ethers.utils.formatBytes32String( "Jeff Bezos"),
                data: [...Buffer.from("networth:144.5b")]
            }
        ];

        const addRankingTx1 = await leaderboard.addRanking(testRankings[0].rank, testRankings[0].name, testRankings[0].data);
        await addRankingTx1.wait();
        const addRankingTx2 = await leaderboard.addRanking(testRankings[1].rank, testRankings[1].name, testRankings[1].data);
        await addRankingTx2.wait();

        return { Leaderboard, leaderboard, facilitator, addr1, addr2 };
    }

    describe("Deployment", async function () {
        it("should set the facilitator correctly", async function () {
            const {leaderboard, facilitator} = await loadFixture(deployFixture);
            expect(await leaderboard.facilitator(), "Address did not match facilitator").to.equal(facilitator.address);
        });
    });

    describe("Get rankings", async function () {
        it("should get a ranking given an id", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const elonTestRanking = {
                id: 0,
                name: ethers.utils.formatBytes32String( "Elon Musk"),
                rank: 1,
                data: [...Buffer.from("networth:232.4b")]
            };

            const jeffTestRanking = {
                id: 1,
                name:  ethers.utils.formatBytes32String( "Jeff Bezos"),
                rank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            const elonRanking = await leaderboard.getRanking(1);
            const jeffRanking = await leaderboard.getRanking(2);

            expect(elonRanking.id, "Elon's ID did not match test ID").to.equal(elonTestRanking.id);
            expect(elonRanking.name, "Elon's name did not match test name").to.equal(elonTestRanking.name);
            expect(elonRanking.rank, "Elon's rank did not match test rank").to.equal(elonTestRanking.rank);
            expect(elonRanking.data, "Elon's data did not match test data").to.equal(ethers.utils.hexlify(elonTestRanking.data));
            expect(jeffRanking.id, "Jeff's ID did not match test ID").to.equal(jeffTestRanking.id);
            expect(jeffRanking.name, "Jeff's name did not match test name").to.equal(jeffTestRanking.name);
            expect(jeffRanking.rank, "Jeff's rank did not match test rank").to.equal(jeffTestRanking.rank);
            expect(jeffRanking.data, "Jeff's data did not match test data").to.equal(ethers.utils.hexlify(jeffTestRanking.data));
        });

        it("should revert with an error if a ranking does not exist", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            await expect(leaderboard.getRanking(10)).to.be.revertedWith("RankingDoesNotExist");
        });
    });

    describe("Add rankings", async function () {
        it("should create a new ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name:  ethers.utils.formatBytes32String("Someone"),
                rank: 3,
                data: []
            };

            const addRankingTx = await leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data);
            await addRankingTx.wait();

            const ranking = await leaderboard.getRanking(testRanking.rank);

            expect(await leaderboard.rankingsSize(), "Size did not match").to.equal(3);
            expect(ranking.id, "ID did not match test ID").to.equal(testRanking.id);
            expect(ranking.name, "Name did not match test name").to.equal(testRanking.name);
            expect(ranking.rank,"Rank did not match test rank").to.equal(testRanking.rank, );
            expect(ranking.data, "Data did not match test data").to.equal("0x");
        });

        it("should emit RankingAdded event when a new ranking is created", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 3,
                name:  ethers.utils.formatBytes32String("Someone"),
                rank: 4,
                data: []
            };

            await expect(leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data))
                .to.emit(leaderboard, "RankingAdded")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, "0x"]); // structs are returned as an array
        });

        it("should revert if a name is not provided when adding a new ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            // Error rankings should never be added
            const errorRanking = {
                id: 4,
                name:  ethers.utils.formatBytes32String(""),
                rank: 5,
                data: []
            };

            await expect(leaderboard.addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("A name has to be used to be added to the rankings.")
        });

        it("should revert if a zero ranking is provided when adding a new ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const errorRanking = {
                id: 4,
                rank: 0,
                name:  ethers.utils.formatBytes32String("A name"),
                data: []
            };

            await expect(leaderboard.addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("Rank has to be greater than 1.");
        });

        it("should not allow any address other than the facilitator to add a new ranking", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const errorRanking = {
                id: 4,
                rank: 5,
                name:  ethers.utils.formatBytes32String("A name"),
                data: []
            };

            await expect(leaderboard.connect(addr1).addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("User is not the facilitator.");
        });

        it("should not allow adding a rank that already exists", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const errorRanking = {
                id: 4,
                rank: 4,
                name:  ethers.utils.formatBytes32String("A name"),
                data: []
            };

            await expect(leaderboard.addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
               .to.be.revertedWith("RankingAlreadyExists");
        });

        it("should allow arbitrary data in the data field", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 4,
                rank: 5,
                name:  ethers.utils.formatBytes32String("A name"),
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            await expect(leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data))
                .to.emit(leaderboard, "RankingAdded")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, ethers.utils.hexlify(testRanking.data)]); // structs are returned as an array
        });
    });

    describe("Remove rankings", async function () {
        it("should remove a ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const elonTestRanking = {
                id: 0,
                name: ethers.utils.formatBytes32String( "Elon Musk"),
                rank: 1,
                data: [...Buffer.from("networth:232.4b")]
            };

            const removeRankingTx = await leaderboard.removeRanking(elonTestRanking.id, elonTestRanking.rank, elonTestRanking.name);
            await removeRankingTx.wait();

            await expect(leaderboard.getRanking(elonTestRanking.rank)).to.be.revertedWith("RankingDoesNotExist");
        });

        it("should not be able to remove a ranking if the user is not the facilitator", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const jeffTestRanking = {
                id: 1,
                name:  ethers.utils.formatBytes32String( "Jeff Bezos"),
                rank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            await expect(leaderboard.connect(addr1).removeRanking(jeffTestRanking.id, jeffTestRanking.rank, jeffTestRanking.name))
                .to.be.revertedWith("User is not the facilitator.");
        });

        it("should emit RankingRemoved event when a ranking is deleted", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const jeffTestRanking = {
                id: 1,
                name:  ethers.utils.formatBytes32String( "Jeff Bezos"),
                rank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            await expect(leaderboard.removeRanking(jeffTestRanking.id, jeffTestRanking.rank, jeffTestRanking.name))
                .to.emit(leaderboard, "RankingRemoved")
                .withArgs([jeffTestRanking.id, jeffTestRanking.name, jeffTestRanking.rank, ethers.utils.hexlify(jeffTestRanking.data)]);
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
