// @ts-ignore
import {ethers, waffle} from "hardhat";
import {expect} from "chai";
import {loadFixture} from "ethereum-waffle";
import {BigNumber} from "ethers";

describe("Leaderboard", function () {
    // Test variables
    const EMPTY_BYTES = "0x";
    const EMPTY_STRING = ethers.utils.formatBytes32String("");

    async function deployFixture() {
        const Leaderboard = await ethers.getContractFactory("Leaderboard");
        const [facilitator, addr1, addr2, addr3] = await ethers.getSigners();

        const commissionFee = ethers.utils.parseEther("0.0025");
        const initialFunding = ethers.utils.parseEther("2.0");

        const leaderboard = await Leaderboard.deploy(ethers.utils.formatBytes32String("Leaderboard"), new Date("12/12/2022").getTime(), commissionFee, {value: initialFunding});
        await leaderboard.deployed();

        const testRankings = [
            {
                id: 0,
                rank: 1,
                name: ethers.utils.formatBytes32String("Elon Musk"),
                data: [...Buffer.from("networth:232.4b")]
            },
            {
                id: 1,
                rank: 2,
                name: ethers.utils.formatBytes32String("Jeff Bezos"),
                data: [...Buffer.from("networth:144.5b")]
            }
        ];

        const addRankingTx1 = await leaderboard.addRanking(testRankings[0].rank, testRankings[0].name, testRankings[0].data);
        await addRankingTx1.wait();
        const addRankingTx2 = await leaderboard.addRanking(testRankings[1].rank, testRankings[1].name, testRankings[1].data);
        await addRankingTx2.wait();

        return {Leaderboard, leaderboard, facilitator, addr1, addr2, addr3};
    }

    describe("Deployment", async function () {
        it("should set the facilitator correctly", async function () {
            const {leaderboard, facilitator} = await loadFixture(deployFixture);
            expect(await leaderboard.facilitator(), "Address did not match facilitator").to.equal(facilitator.address);
        });

        it("should not deploy the contract if it isn't funded", async function () {
            const Leaderboard = await ethers.getContractFactory("Leaderboard");

            const commissionFee = ethers.utils.parseEther("0.0025");

            await expect(Leaderboard.deploy(ethers.utils.formatBytes32String("Leaderboard"), new Date("12/12/2022").getTime(), commissionFee, {value: ethers.utils.parseEther("0.0")}))
                .to.be.revertedWith("ContractNotFunded");
        });
    });

    describe("Initial balance", async function () {
        it("should be funded with an initial balance for the reward pool", async function () {
            const {leaderboard} = await loadFixture(deployFixture);
            const provider = waffle.provider;

            const initialFunding = ethers.utils.parseEther("2.0");

            expect(await provider.getBalance(leaderboard.address), "Contract balance does not equal the funding amount").to.equal(initialFunding);
            expect(await leaderboard.rewardPool(), "The reward pool did not update").to.equal(initialFunding);
            expect(await leaderboard.initialFunding(), "The initial funding did not update").to.equal(initialFunding);
        });
    });

    describe("Get rankings", async function () {
        it("should get a ranking given a rank", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const elonTestRanking = {
                id: 0,
                name: ethers.utils.formatBytes32String("Elon Musk"),
                rank: 1,
                startingRank: 1,
                data: [...Buffer.from("networth:232.4b")]
            };

            const jeffTestRanking = {
                id: 1,
                name: ethers.utils.formatBytes32String("Jeff Bezos"),
                rank: 2,
                startingRank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            const elonRanking = await leaderboard.getRankingByRank(elonTestRanking.rank);
            const jeffRanking = await leaderboard.getRankingByRank(jeffTestRanking.rank);

            expect(elonRanking.id, "Elon's ID did not match test ID").to.equal(elonTestRanking.id);
            expect(elonRanking.name, "Elon's name did not match test name").to.equal(elonTestRanking.name);
            expect(elonRanking.rank, "Elon's rank did not match test rank").to.equal(elonTestRanking.rank);
            expect(elonRanking.startingRank, "Elon's starting rank did not match test rank").to.equal(elonTestRanking.startingRank);
            expect(elonRanking.data, "Elon's data did not match test data").to.equal(ethers.utils.hexlify(elonTestRanking.data));

            expect(jeffRanking.id, "Jeff's ID did not match test ID").to.equal(jeffTestRanking.id);
            expect(jeffRanking.name, "Jeff's name did not match test name").to.equal(jeffTestRanking.name);
            expect(jeffRanking.rank, "Jeff's rank did not match test rank").to.equal(jeffTestRanking.rank);
            expect(jeffRanking.startingRank, "Jeff's starting rank did not match test rank").to.equal(jeffTestRanking.startingRank);
            expect(jeffRanking.data, "Jeff's data did not match test data").to.equal(ethers.utils.hexlify(jeffTestRanking.data));
        });

        it("should revert with an error if a ranking rank does not exist", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            await expect(leaderboard.getRankingByRank(10)).to.be.revertedWith("RankingDoesNotExist");
        });

        it("should get a ranking given an id", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const elonTestRanking = {
                id: 0,
                name: ethers.utils.formatBytes32String("Elon Musk"),
                rank: 1,
                startingRank: 1,
                data: [...Buffer.from("networth:232.4b")]
            };

            const jeffTestRanking = {
                id: 1,
                name: ethers.utils.formatBytes32String("Jeff Bezos"),
                rank: 2,
                startingRank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            const elonRanking = await leaderboard.getRankingFromId(elonTestRanking.id);
            const jeffRanking = await leaderboard.getRankingFromId(jeffTestRanking.id);

            expect(elonRanking.id, "Elon's ID did not match test ID").to.equal(elonTestRanking.id);
            expect(elonRanking.name, "Elon's name did not match test name").to.equal(elonTestRanking.name);
            expect(elonRanking.rank, "Elon's rank did not match test rank").to.equal(elonTestRanking.rank);
            expect(elonRanking.startingRank, "Elon's starting rank did not match test rank").to.equal(elonTestRanking.startingRank);
            expect(elonRanking.data, "Elon's data did not match test data").to.equal(ethers.utils.hexlify(elonTestRanking.data));

            expect(jeffRanking.id, "Jeff's ID did not match test ID").to.equal(jeffTestRanking.id);
            expect(jeffRanking.name, "Jeff's name did not match test name").to.equal(jeffTestRanking.name);
            expect(jeffRanking.rank, "Jeff's rank did not match test rank").to.equal(jeffTestRanking.rank);
            expect(jeffRanking.startingRank, "Jeff's starting rank did not match test rank").to.equal(jeffTestRanking.startingRank);
            expect(jeffRanking.data, "Jeff's data did not match test data").to.equal(ethers.utils.hexlify(jeffTestRanking.data));
        });

        it("should revert with an error if a ranking id does not exist", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            await expect(leaderboard.getRankingFromId(10)).to.be.revertedWith("RankingDoesNotExist");
        });
    });

    describe("Add rankings", async function () {
        it("should create a new ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            const addRankingTx = await leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data);
            await addRankingTx.wait();

            const ranking = await leaderboard.getRankingByRank(testRanking.rank);

            expect(await leaderboard.rankingsSize(), "Size did not match").to.equal(3);
            expect(ranking.id, "ID did not match test ID").to.equal(testRanking.id);
            expect(ranking.name, "Name did not match test name").to.equal(testRanking.name);
            expect(ranking.rank, "Rank did not match test rank").to.equal(testRanking.rank);
            expect(ranking.startingRank, "Starting rank did not match test rank").to.equal(testRanking.startingRank);
            expect(ranking.data, "Data did not match test data").to.equal(EMPTY_BYTES);
        });

        it("should emit RankingAdded event when a new ranking is created", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 4,
                startingRank: 4,
                data: []
            };

            await expect(leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data))
                .to.emit(leaderboard, "RankingAdded")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, testRanking.startingRank, EMPTY_BYTES]); // structs are returned as an array
        });

        it("should revert if a name is not provided when adding a new ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            // Error rankings should never be added
            const errorRanking = {
                id: 4,
                name: EMPTY_STRING,
                rank: 5,
                startingRank: 5,
                data: []
            };

            await expect(leaderboard.addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("A name has to be used to be added to the rankings.")
        });

        it("should revert if a zero ranking is provided when adding a new ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const errorRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 0,
                startingRank: 0,
                data: []
            };

            await expect(leaderboard.addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("RankNeedsToBeGreaterThanOne");
        });

        it("should not allow any address other than the facilitator to add a new ranking", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const errorRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 5,
                startingRank: 5,
                data: []
            };

            await expect(leaderboard.connect(addr1).addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("UserIsNotFacilitator");
        });

        it("should not allow adding a rank that already exists", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const errorRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 4,
                startingRank: 4,
                data: []
            };

            await expect(leaderboard.addRanking(errorRanking.rank, errorRanking.name, errorRanking.data))
                .to.be.revertedWith("RankingAlreadyExists");
        });

        it("should allow arbitrary data in the data field", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 5,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            await expect(leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data))
                .to.emit(leaderboard, "RankingAdded")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, testRanking.startingRank, ethers.utils.hexlify(testRanking.data)]); // structs are returned as an array
        });
    });

    describe("Remove rankings", async function () {
        it("should remove a ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const elonTestRanking = {
                id: 0,
                name: ethers.utils.formatBytes32String("Elon Musk"),
                rank: 1,
                startingRank: 1,
                data: [...Buffer.from("networth:232.4b")]
            };

            const removeRankingTx = await leaderboard.removeRanking(elonTestRanking.id, elonTestRanking.rank, elonTestRanking.name);
            await removeRankingTx.wait();

            await expect(leaderboard.getRankingByRank(elonTestRanking.rank)).to.be.revertedWith("RankingDoesNotExist");
        });

        it("should not be able to remove a ranking if the user is not the facilitator", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const jeffTestRanking = {
                id: 1,
                name: ethers.utils.formatBytes32String("Jeff Bezos"),
                rank: 2,
                startingRank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            await expect(leaderboard.connect(addr1).removeRanking(jeffTestRanking.id, jeffTestRanking.rank, jeffTestRanking.name))
                .to.be.revertedWith("UserIsNotFacilitator");
        });

        it("should emit RankingRemoved event when a ranking is deleted", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const jeffTestRanking = {
                id: 1,
                name: ethers.utils.formatBytes32String("Jeff Bezos"),
                rank: 2,
                startingRank: 2,
                data: [...Buffer.from("networth:144.5b")]
            };

            await expect(leaderboard.removeRanking(jeffTestRanking.id, jeffTestRanking.rank, jeffTestRanking.name))
                .to.emit(leaderboard, "RankingRemoved")
                .withArgs([jeffTestRanking.id, jeffTestRanking.name, jeffTestRanking.rank, jeffTestRanking.startingRank, ethers.utils.hexlify(jeffTestRanking.data)]);
        });
    });

    describe("Update rankings", async function () {
        it("should be able update a ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const fromRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 4,
                startingRank: 4,
                data: []
            };

            const toRanking = {
                id: 4,
                rank: 5,
                startingRank: 5,
                name: ethers.utils.formatBytes32String("A name"),
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const updateRankingTx = await leaderboard.swapRank(fromRanking.id, fromRanking.rank, toRanking.id, toRanking.rank);
            await updateRankingTx.wait();

            const postFromRanking = await leaderboard.getRankingByRank(toRanking.rank);
            const postToRanking = await leaderboard.getRankingByRank(fromRanking.rank);

            expect(postFromRanking.rank, "From ranking did not change").to.equal(toRanking.rank);
            // Only the rank changed
            expect(postFromRanking.id, "From ranking id changed").to.equal(fromRanking.id);
            expect(postFromRanking.name, "From ranking name changed").to.equal(fromRanking.name);
            expect(postFromRanking.data, "To ranking data changed").to.equal(EMPTY_BYTES);
            expect(postFromRanking.startingRank, "From ranking starting rank did not change").to.equal(fromRanking.startingRank);

            expect(postToRanking.rank, "To ranking did not change").to.equal(fromRanking.rank);
            // Only the rank changed
            expect(postToRanking.id, "To ranking id changed").to.equal(toRanking.id);
            expect(postToRanking.name, "To ranking name changed").to.equal(toRanking.name);
            expect(postToRanking.data, "To ranking data changed").to.equal(ethers.utils.hexlify(toRanking.data));
            expect(postToRanking.startingRank, "To ranking starting rank did not change").to.equal(toRanking.startingRank);
        });

        it("should not be able to update a ranking to a zero ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const fromRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                data: []
            };

            const toRanking = {
                id: 4,
                rank: 4,
                name: ethers.utils.formatBytes32String("A name"),
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            await expect(leaderboard.swapRank(fromRanking.id, fromRanking.rank, toRanking.id, 0))
                .to.be.revertedWith("RankNeedsToBeGreaterThanOne");
            await expect(leaderboard.swapRank(fromRanking.id, 0, toRanking.id, toRanking.rank))
                .to.be.revertedWith("RankNeedsToBeGreaterThanOne");
        });

        it("should not be able to update a ranking to or from a nonexistent ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const fromRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                data: []
            };

            await expect(leaderboard.swapRank(fromRanking.id, fromRanking.rank, 20, 16))
                .to.be.revertedWith("RankingDoesNotExist");
            await expect(leaderboard.swapRank(20, 16, fromRanking.id, fromRanking.rank))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should emit RankingUpdated event when a ranking is updated", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const fromRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                startingRank: 4,
                data: []
            };

            const toRanking = {
                id: 4,
                rank: 4,
                startingRank: 5,
                name: ethers.utils.formatBytes32String("A name"),
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            await expect(leaderboard.swapRank(fromRanking.id, fromRanking.rank, toRanking.id, toRanking.rank))
                .to.emit(leaderboard, "RankingUpdatedFrom")
                .withArgs([fromRanking.id, fromRanking.name, toRanking.rank, fromRanking.startingRank, ethers.utils.hexlify(fromRanking.data)])
                .to.emit(leaderboard, "RankingUpdatedTo")
                .withArgs([toRanking.id, toRanking.name, fromRanking.rank, toRanking.startingRank, ethers.utils.hexlify(toRanking.data)])
        });

        it("should revert if the id and rankings are invalid", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const fromRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                startingRank: 4,
                data: []
            };

            const toRanking = {
                id: 4,
                rank: 4,
                startingRank: 5,
                name: ethers.utils.formatBytes32String("A name"),
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            await expect(leaderboard.swapRank(fromRanking.id, fromRanking.rank, toRanking.id, toRanking.rank))
                .to.be.revertedWith("RankingUpdateArgsAreInvalid");
        });

        it("should be able to update a ranking name", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            const newName = ethers.utils.formatBytes32String("Bernard Arnault");

            const updateNameTx = await leaderboard.updateName(testRanking.id, newName);
            await updateNameTx.wait();

            const ranking = await leaderboard.getRankingByRank(testRanking.rank);

            expect(ranking.name, "Name did not change").to.equal(newName);
            expect(ranking.id, "Id changed").to.equal(testRanking.id);
            expect(ranking.rank, "Rank changed").to.equal(testRanking.rank);
            expect(ranking.startingRank, "Starting rank changed").to.equal(testRanking.startingRank);
        });

        it("should revert if updating the name of a nonexistent ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 23,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            await expect(leaderboard.updateName(testRanking.id, EMPTY_STRING))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should revert if updating a ranking name to an empty string", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            await expect(leaderboard.updateName(testRanking.id, EMPTY_STRING))
                .to.be.revertedWith("RankingNameCannotBeEmpty");
        });

        it("should revert if updating a ranking name with the same existing name", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            await expect(leaderboard.updateName(testRanking.id, testRanking.name))
                .to.be.revertedWith("RankingNameSuppliedIsTheSame");
        });

        it("should emit RankingUpdated when ranking name changed", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            const newName = ethers.utils.formatBytes32String("Someone");

            await expect(leaderboard.updateName(testRanking.id, newName))
                .to.emit(leaderboard, "RankingUpdated")
                .withArgs([testRanking.id, newName, testRanking.rank, testRanking.startingRank, ethers.utils.hexlify(testRanking.data)])

            await expect(leaderboard.updateName(testRanking.id, testRanking.name))
                .to.emit(leaderboard, "RankingUpdated")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, testRanking.startingRank, ethers.utils.hexlify(testRanking.data)])
        });

        it("should be able to update ranking data", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            const newData = [...Buffer.from("networth:151b;country:France")]

            const updateDataTx = await leaderboard.updateData(testRanking.id, newData);
            await updateDataTx.wait();

            const ranking = await leaderboard.getRankingByRank(testRanking.rank);

            expect(ranking.data, "Data did not change").to.equal(ethers.utils.hexlify(newData));
            expect(ranking.id, "Id changed").to.equal(testRanking.id);
            expect(ranking.rank, "Rank changed").to.equal(testRanking.rank);
            expect(ranking.startingRank, "Starting rank changed").to.equal(testRanking.startingRank);
            expect(ranking.name, "Name changed").to.equal(testRanking.name);
        });

        it("should revert if updating the data of a nonexistent ranking", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 23,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            await expect(leaderboard.updateData(testRanking.id, testRanking.data))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should revert if updating the data with empty data", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            await expect(leaderboard.updateData(testRanking.id, testRanking.data))
                .to.be.revertedWith("RankingDataArgCannotBeEmpty");
        });

        it("should revert if updating data with the same data", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: [...Buffer.from("networth:151b;country:France")]
            };

            await expect(leaderboard.updateData(testRanking.id, testRanking.data))
                .to.be.revertedWith("RankingDataSuppliedIsTheSame");
        });

        it("should emit RankingUpdated when ranking data changed", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: [...Buffer.from("differentsetofdata")]
            };

            await expect(leaderboard.updateData(testRanking.id, testRanking.data))
                .to.emit(leaderboard, "RankingUpdated")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, testRanking.startingRank, ethers.utils.hexlify(testRanking.data)])
        });
    });

    describe("Add stakes", async function () {
        it("should allow a user to add a stake and increase the reward pool when a new stake is added", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const provider = waffle.provider;
            const initialLeaderboardBalance = await provider.getBalance(leaderboard.address);
            const initialAddrBalance = await addr1.getBalance();

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const initialFundingAmount = "2.0";
            const stakeAmount = "1.0";

            const stakeTx = await leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)});
            await stakeTx.wait();

            const stake = await leaderboard.userStakes(testRanking.id, 0);

            expect(+ethers.utils.formatEther(await addr1.getBalance()), "Addr1 balance is not less than before")
                .to.be.lessThan(+ethers.utils.formatEther(initialAddrBalance));
            expect(+ethers.utils.formatEther(await provider.getBalance(leaderboard.address)), "Leaderboard contract balance is not greater than before")
                .to.greaterThan(+ethers.utils.formatEther(initialLeaderboardBalance));
            expect(await leaderboard.userStakesSize(), "User stake size is not 1").to.equal(1);
            expect(await leaderboard.rewardPool(), "Reward pool did not update").to.equal(BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(ethers.utils.parseEther(initialFundingAmount))); // reward pool return value in wei

            // Checking the stake added by the user
            expect(stake.addr, "Stake has incorrect address").to.equal(addr1.address);
            expect(stake.id, "Stake has incorrect id").to.equal(testRanking.id);
            expect(stake.name, "Stake has incorrect name").to.equal(testRanking.name);
            expect(ethers.utils.formatEther(stake.liquidity), "Stake has incorrect liquidity").to.equal(stakeAmount); // liquidity staked should format to "1.0"
        });

        it("should revert if a user is trying to stake onto an invalid id", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";

            await expect(leaderboard.connect(addr2).addStake(20, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.be.revertedWith("RankingDoesNotExist");
            await expect(leaderboard.connect(addr2).addStake(3, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should revert if a user is trying to stake onto a ranking passing in the incorrect name", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
            };

            const stakeAmount = "1.0";

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, ethers.utils.formatBytes32String("Someone"), {value: ethers.utils.parseEther(stakeAmount)}))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should revert if a user is trying to stake with zero ether", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "0.0";

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.be.revertedWith("Stake has to be a non-zero amount.");
        });

        it("should revert if a user has already staked for this ranking", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";

            await expect(leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.be.revertedWith("UserAlreadyStaked");
        });

        it("should emit a UserStakeAdded event", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";
            const rewardPool = await leaderboard.rewardPool();

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr2.address, [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);
            expect(await leaderboard.userStakesSize(), "User stake size is not 2").to.equal(2);
            expect(await leaderboard.rewardPool(), "Reward pool did not update").to.equal(BigNumber.from(rewardPool).add(ethers.utils.parseEther(stakeAmount))); // reward pool return value in wei
        });
    });

    describe("Withdraw stakes", async function () {
        it("should withdraw stake for a user if it exists for a ranking", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const provider = waffle.provider;
            const initialLeaderboardBalance = await provider.getBalance(leaderboard.address);
            const initialAddrBalance = await addr2.getBalance();

            const testRanking = {
                id: 2,
            };

            const rewardPool = await leaderboard.rewardPool();

            const stakeAmount = "1.0";

            const stakeTx = await leaderboard.connect(addr2).withdrawStake(addr2.address, testRanking.id);
            await stakeTx.wait();

            expect(+ethers.utils.formatEther(await addr2.getBalance()), "Addr1 balance is not greater than before")
                .to.be.greaterThan(+ethers.utils.formatEther(initialAddrBalance));
            expect(+ethers.utils.formatEther(await provider.getBalance(leaderboard.address)), "Leaderboard contract balance is not less than before")
                .to.lessThan(+ethers.utils.formatEther(initialLeaderboardBalance));

            expect(await leaderboard.userStakesSize(), "User stake size is not 1").to.equal(1);
            expect(await leaderboard.rewardPool(), "Reward pool did not update").to.equal(BigNumber.from(rewardPool).sub(ethers.utils.parseEther(stakeAmount))); // reward pool return values in wei

            await expect(leaderboard.userStakes(testRanking.id, 1)).to.be.revertedWith(""); // Non-named reversion can pass in an empty string
        });

        it("should revert if a user tries withdrawing a stake he doesn't have", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
            };

            await expect(leaderboard.connect(addr2).withdrawStake(addr2.address, testRanking.id))
                .to.be.revertedWith("UserHasNotStakedYet");
        });

        it("should revert if a user tries withdrawing another address's stake", async function () {
            const {leaderboard, addr1, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
            };

            await expect(leaderboard.connect(addr2).withdrawStake(addr1.address, testRanking.id))
                .to.be.revertedWith("Transaction sender is neither the owner of the stake or the facilitator.");
        });

        it("should allow the facilitator to withdraw a user's stake for them", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const initialAddrBalance = await addr2.getBalance();

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr2.address, [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);

            expect(+ethers.utils.formatEther(await addr2.getBalance()), "Addr1 balance is not less than before")
                .to.be.lessThan(+ethers.utils.formatEther(initialAddrBalance));

            const afterBalance = await addr2.getBalance();

            await expect(leaderboard.withdrawStake(addr2.address, testRanking.id))
                .to.emit(leaderboard, "UserStakeWithdrawn")
                .withArgs(addr2.address, [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);

            expect(+ethers.utils.formatEther(await addr2.getBalance()), "Addr1 balance is not greater than before")
                .to.be.greaterThan(+ethers.utils.formatEther(afterBalance));
        });

        it("should emit UserStakeWithdraw event when a user successfully withdraw a stake", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";

            await expect(leaderboard.connect(addr1).withdrawStake(addr1.address, testRanking.id))
                .to.emit(leaderboard, "UserStakeWithdrawn")
                .withArgs(addr1.address, [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);
        });

        it("should revert entirely if there are no stakes in the contract", async function () {
            const {leaderboard, addr1, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            await expect(leaderboard.connect(addr1).withdrawStake(addr1.address, testRanking.id))
                .to.be.revertedWith("NoStakesAddedForRankingYet");
            await expect(leaderboard.connect(addr2).withdrawStake(addr2.address, testRanking.id))
                .to.be.revertedWith("NoStakesAddedForRankingYet");
        });
    });

    describe("Return stakes", async function () {
        it("should return stakes when a ranking is removed if there are any", async function () {
            const {leaderboard, addr1, addr2} = await loadFixture(deployFixture);

            const initialAddr1Balance = await addr1.getBalance();
            const initialAddr2Balance = await addr2.getBalance();

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
                rank: 3,
                startingRank: 3,
                data: [...Buffer.from("differentsetofdata")]
            };

            const stakeAmount = "1.0";
            const rankingsSizePrev = await leaderboard.rankingsSize();

            await expect(leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr1.address, [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);

            expect(+ethers.utils.formatEther(await addr1.getBalance()), "Addr1 balance is not less than before")
                .to.be.lessThan(+ethers.utils.formatEther(initialAddr1Balance));

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr2.address, [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);

            expect(+ethers.utils.formatEther(await addr2.getBalance()), "Addr2 balance is not less than before")
                .to.be.lessThan(+ethers.utils.formatEther(initialAddr2Balance));

            const rewardPool = await leaderboard.rewardPool();

            const beforeRankingRemovedBalance1 = await addr1.getBalance();
            const beforeRankingRemovedBalance2 = await addr2.getBalance();

            await expect(leaderboard.removeRanking(testRanking.id, testRanking.rank, testRanking.name))
                .to.emit(leaderboard, "RankingRemoved")
                .withArgs([testRanking.id, testRanking.name, testRanking.rank, testRanking.startingRank, ethers.utils.hexlify(testRanking.data)])
                .to.emit(leaderboard, "UserStakeWithdrawn")
                .withArgs(addr1.address, [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)])
                .to.emit(leaderboard, "UserStakeWithdrawn")
                .withArgs(addr2.address, [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);

            const afterRankingRemovedBalance1 = await addr1.getBalance();
            const afterRankingRemovedBalance2 = await addr2.getBalance();

            expect(await leaderboard.rankingsSize(), "Ranking size did not decrease by 1").to.equal(rankingsSizePrev - 1);
            expect(await leaderboard.rewardPool(), "Reward pool did not decrease by the amount of stakes removed").to.be.equal(
                BigNumber.from(rewardPool).sub(ethers.utils.parseEther(stakeAmount)).sub(ethers.utils.parseEther(stakeAmount))
            );

            expect(+ethers.utils.formatEther(afterRankingRemovedBalance1), "Addr1 balance is not greater than before")
                .to.be.greaterThan(+ethers.utils.formatEther(beforeRankingRemovedBalance1));
            expect(+ethers.utils.formatEther(afterRankingRemovedBalance1), "Addr1 balance is greater than initial value")
                .to.not.be.greaterThan(+ethers.utils.formatEther(initialAddr1Balance));

            expect(+ethers.utils.formatEther(afterRankingRemovedBalance2), "Addr2 balance is not greater than before")
                .to.be.greaterThan(+ethers.utils.formatEther(beforeRankingRemovedBalance2));
            expect(+ethers.utils.formatEther(afterRankingRemovedBalance2), "Addr2 balance is greater than initial value")
                .to.not.be.greaterThan(+ethers.utils.formatEther(initialAddr2Balance));

            await expect(leaderboard.userStakes(testRanking.id, 0)) // array should no longer exist
                .to.be.revertedWith("");
        });

        it("should not return any stakes if none exist for the ranking", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const testRanking1 = {
                id: 3,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 4,
                startingRank: 4,
                data: []
            };

            const testRanking2 = {
                id: 4,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 5,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const stakeAmount = "1.0";

            expect(+(await leaderboard.userStakesSize())).to.equal(0);

            await expect(leaderboard.connect(addr1).addStake(testRanking1.id, testRanking1.name, {value: ethers.utils.parseEther(stakeAmount)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr1.address, [addr1.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)]);

            expect(+(await leaderboard.userStakesSize())).to.be.greaterThan(0);

            await expect(leaderboard.removeRanking(testRanking2.id, testRanking2.rank, testRanking2.name))
                .to.emit(leaderboard, "RankingRemoved")
                .withArgs([testRanking2.id, testRanking2.name, testRanking2.rank, testRanking2.startingRank, ethers.utils.hexlify(testRanking2.data)])
                .to.not.emit(leaderboard, "UserStakeWithdrawn");

            expect(+(await leaderboard.userStakesSize())).to.be.greaterThan(0);
        });
    });

    describe("Allocate rewards", async function () {

    });

    describe("Contract ended", async function () {
        it("should revert adding stakes if the contract has already ended", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            await ethers.provider.send("evm_setNextBlockTimestamp", [new Date("12/12/2023").getTime()]);

            await expect(leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: ethers.utils.parseEther("1")}))
                .to.be.revertedWith("ContractEnded");
        });

        it("should revert withdrawing stakes if the contract has already ended", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            await expect(leaderboard.connect(addr1).withdrawStake(addr1.address, testRanking.id))
                .to.be.revertedWith("ContractEnded");
        });
    });
});

describe("Destroy contract", async function () {
    it("should return all stakes to their respective addresses and emit a ContractDestroyed event", async function () {
        const Leaderboard = await ethers.getContractFactory("Leaderboard");
        const [addr1, addr2, addr3] = await ethers.getSigners();

        const initialAddr1Balance = await addr1.getBalance();
        const initialAddr2Balance = await addr2.getBalance();
        const initialAddr3Balance = await addr3.getBalance();

        const commissionFee = ethers.utils.parseEther("0.0025");

        const leaderboard = await Leaderboard.deploy(ethers.utils.formatBytes32String("Leaderboard"), new Date("12/12/2025").getTime(), commissionFee, {value: ethers.utils.parseEther("2.0")});
        await leaderboard.deployed();

        const testRanking1 = {
            id: 0,
            rank: 1,
            name: ethers.utils.formatBytes32String("Elon Musk"),
            data: [...Buffer.from("networth:232.4b")]
        };

        const testRanking2 = {
            id: 1,
            rank: 2,
            name: ethers.utils.formatBytes32String("Jeff Bezos"),
            data: [...Buffer.from("networth:144.5b")]
        };

        const addRankingTx1 = await leaderboard.addRanking(testRanking1.rank, testRanking1.name, testRanking1.data);
        await addRankingTx1.wait();

        const addRankingTx2 = await leaderboard.addRanking(testRanking2.rank, testRanking2.name, testRanking2.data);
        await addRankingTx2.wait();

        const stakeAmount = "1.0";

        expect(+(await leaderboard.userStakesSize())).to.equal(0);

        await expect(leaderboard.connect(addr1).addStake(testRanking1.id, testRanking1.name, {value: ethers.utils.parseEther(stakeAmount)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr1.address, [addr1.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr1).addStake(testRanking2.id, testRanking2.name, {value: ethers.utils.parseEther(stakeAmount)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr1.address, [addr1.address, testRanking2.id, testRanking2.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr2).addStake(testRanking1.id, testRanking1.name, {value: ethers.utils.parseEther(stakeAmount)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr2.address, [addr2.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr2).addStake(testRanking2.id, testRanking2.name, {value: ethers.utils.parseEther(stakeAmount)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr2.address, [addr2.address, testRanking2.id, testRanking2.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr3).addStake(testRanking1.id, testRanking1.name, {value: ethers.utils.parseEther(stakeAmount)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr3.address, [addr3.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)]);

        expect(+(await leaderboard.userStakesSize())).to.be.greaterThan(1);

        const beforeDestroyContractAddr1Balance = await addr1.getBalance();
        const beforeDestroyContractAddr2Balance = await addr2.getBalance();
        const beforeDestroyContractAddr3Balance = await addr3.getBalance();

        expect(+ethers.utils.formatEther(beforeDestroyContractAddr1Balance), "Addr1 balance is not less than before the contract is destroyed")
            .to.be.lessThan(+ethers.utils.formatEther(initialAddr1Balance));
        expect(+ethers.utils.formatEther(beforeDestroyContractAddr2Balance), "Addr2 balance is not less than before the contract is destroyed")
            .to.be.lessThan(+ethers.utils.formatEther(initialAddr2Balance));
        expect(+ethers.utils.formatEther(beforeDestroyContractAddr3Balance), "Addr3 balance is not less than before the contract is destroyed")
            .to.be.lessThan(+ethers.utils.formatEther(initialAddr3Balance));

        await expect(leaderboard.destroyContract())
            .to.emit(leaderboard, "UserStakeWithdrawn")
            .withArgs(addr1.address, [addr1.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)])
            .to.emit(leaderboard, "UserStakeWithdrawn")
            .withArgs(addr1.address, [addr1.address, testRanking2.id, testRanking2.name, ethers.utils.parseEther(stakeAmount)])
            .to.emit(leaderboard, "UserStakeWithdrawn")
            .withArgs(addr2.address, [addr2.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)])
            .to.emit(leaderboard, "UserStakeWithdrawn")
            .withArgs(addr2.address, [addr2.address, testRanking2.id, testRanking2.name, ethers.utils.parseEther(stakeAmount)])
            .to.emit(leaderboard, "UserStakeWithdrawn")
            .withArgs(addr3.address, [addr3.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)])
            .to.emit(leaderboard, "ContractDestroyed");

        expect(+ethers.utils.formatEther(await addr1.getBalance()), "Addr1 balance is not greater than after the contract is destroyed")
            .to.be.greaterThan(+ethers.utils.formatEther(beforeDestroyContractAddr1Balance));
        expect(+ethers.utils.formatEther(await addr2.getBalance()), "Addr2 balance is not greater than after the contract is destroyed")
            .to.be.greaterThan(+ethers.utils.formatEther(beforeDestroyContractAddr2Balance));
        expect(+ethers.utils.formatEther(await addr3.getBalance()), "Addr3 balance is not greater than after the contract is destroyed")
            .to.be.greaterThan(+ethers.utils.formatEther(beforeDestroyContractAddr3Balance));
    });
});