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

        const leaderboard = await Leaderboard.deploy(ethers.utils.formatBytes32String("Leaderboard Fixture"), new Date("12/12/2022").getTime(), commissionFee, {value: initialFunding});
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

    async function deployAllocateRewardFixture() {
        const Leaderboard = await ethers.getContractFactory("Leaderboard");
        const [facilitator, addr1, addr2, addr3] = await ethers.getSigners();

        const commissionFee = ethers.utils.parseEther("0.0025");
        const initialFunding = ethers.utils.parseEther("2.0");

        const leaderboard = await Leaderboard.deploy(ethers.utils.formatBytes32String("Allocate Reward Fixture"), new Date("12/12/2022").getTime(), commissionFee, {value: initialFunding});
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

    describe("Commission Fee", async function () {
       it("should have a commission fee set", async function () {
           const {leaderboard} = await loadFixture(deployFixture);
           const commissionFee = ethers.utils.parseEther("0.0025");

           expect(await leaderboard.commissionFee()).to.equal(commissionFee);
       });
    });

    describe("Minimum Stake Amount", async function () {
        it("should have a minimum stake amount set", async function () {
            const {leaderboard} = await loadFixture(deployFixture);

            expect(+(await leaderboard.MINIMUM_STAKE())).to.be.greaterThan(0);
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
            expect(postFromRanking.startingRank, "From ranking starting rank changed").to.equal(fromRanking.startingRank);

            expect(postToRanking.rank, "To ranking did not change").to.equal(fromRanking.rank);
            // Only the rank changed
            expect(postToRanking.id, "To ranking id changed").to.equal(toRanking.id);
            expect(postToRanking.name, "To ranking name changed").to.equal(toRanking.name);
            expect(postToRanking.data, "To ranking data changed").to.equal(ethers.utils.hexlify(toRanking.data));
            expect(postToRanking.startingRank, "To ranking starting rank changed").to.equal(toRanking.startingRank);
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
            const commissionFee = ethers.utils.parseEther("0.0025");

            const stakeTx = await leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)});
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

        it("should revert if a user cannot pay the commission fee", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "0.05";
            const commissionFee = ethers.utils.parseEther("0.0");

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.be.revertedWith("AmountHasToBeGreaterThanMinimumStakePlusCommission");
        });

        it("should revert if a user is trying to stake onto an invalid id", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";
            const commissionFee = ethers.utils.parseEther("0.0025");

            await expect(leaderboard.connect(addr2).addStake(20, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.be.revertedWith("RankingDoesNotExist");
            await expect(leaderboard.connect(addr2).addStake(3, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should revert if a user is trying to stake onto a ranking passing in the incorrect name", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
            };

            const stakeAmount = "1.0";
            const commissionFee = ethers.utils.parseEther("0.0025");

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, ethers.utils.formatBytes32String("Someone"), {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.be.revertedWith("RankingDoesNotExist");
        });

        it("should revert if the user does not stake more than the minimum amount", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "0.0";
            const commissionFee = ethers.utils.parseEther("0.0025");

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.be.revertedWith("AmountHasToBeGreaterThanMinimumStake");
        });

        it("should revert if a user has already staked for this ranking", async function () {
            const {leaderboard, addr1} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";
            const commissionFee = ethers.utils.parseEther("0.0025");

            await expect(leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.be.revertedWith("UserAlreadyStaked");
        });

        it("should emit a UserStakeAdded event", async function () {
            const {leaderboard, addr2} = await loadFixture(deployFixture);

            const testRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Bernard Arnault"),
            };

            const stakeAmount = "1.0";
            const commissionFee = ethers.utils.parseEther("0.0025");
            const rewardPool = await leaderboard.rewardPool();

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr2.address, [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);
            expect(await leaderboard.userStakesSize(), "User stake size is not 2").to.equal(2);
            expect(await leaderboard.rewardPool(), "Reward pool did not update").to.equal(BigNumber.from(rewardPool).add(ethers.utils.parseEther(stakeAmount))); // reward pool return value in wei
        });
    });

    describe("Get stakes", async function () {
        it("should be able get all user stakes", async function () {
            const {leaderboard} = await loadFixture(deployFixture);
            const userStakes = await leaderboard.getUserStakes();

            expect(await leaderboard.userStakesSize(), "User stake size is not 2").to.equal(userStakes.length);
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
            const commissionFee = ethers.utils.parseEther("0.0025");

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
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

        it("should not allow a user to withdraw a stake after its lock time", async function () {

        });

        it("should allow a facilitator to withdraw a stake for a player regardless of the lock time", async function () {

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
            const commissionFee = ethers.utils.parseEther("0.0025");
            const rankingsSizePrev = await leaderboard.rankingsSize();

            await expect(leaderboard.connect(addr1).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
                .to.emit(leaderboard, "UserStakeAdded")
                .withArgs(addr1.address, [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(stakeAmount)]);

            expect(+ethers.utils.formatEther(await addr1.getBalance()), "Addr1 balance is not less than before")
                .to.be.lessThan(+ethers.utils.formatEther(initialAddr1Balance));

            await expect(leaderboard.connect(addr2).addStake(testRanking.id, testRanking.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
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
            const commissionFee = ethers.utils.parseEther("0.0025");

            expect(+(await leaderboard.userStakesSize())).to.equal(0);

            await expect(leaderboard.connect(addr1).addStake(testRanking1.id, testRanking1.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
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
        // Change here to test other amounts. Values are non-zero unsigned.
        const originalStakeAmounts = [
            "1.2",
            "4.0",
            "2.56",
            "2.00091",
            "8.12",
            "0.9421",
            "3.16",
            "1.66",
            "0.7878"
        ];
        const precision = 10000000000000;

        it("should calculate the right rank changed normalized coefficient", async function () {
            const {leaderboard, addr1} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const fromRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 3,
                startingRank: 3,
                data: []
            };

            const toRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 4,
                startingRank: 4,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const addRankingTx1 = await leaderboard.addRanking(fromRanking.rank, fromRanking.name, fromRanking.data);
            await addRankingTx1.wait();

            const addRankingTx2 = await leaderboard.addRanking(toRanking.rank, toRanking.name, toRanking.data);
            await addRankingTx2.wait();

            const updateRankingTx = await leaderboard.swapRank(fromRanking.id, fromRanking.rank, toRanking.id, toRanking.rank);
            await updateRankingTx.wait();

            const postFromRanking = await leaderboard.getRankingByRank(toRanking.rank);
            const postToRanking = await leaderboard.getRankingByRank(fromRanking.rank);

            expect(postFromRanking.rank, "From ranking did not change").to.equal(toRanking.rank);
            expect(postFromRanking.startingRank, "From ranking starting rank should not change").to.equal(fromRanking.startingRank);

            expect(postToRanking.rank, "To ranking did not change").to.equal(fromRanking.rank);
            expect(postToRanking.startingRank, "To ranking starting rank should not change").to.equal(toRanking.startingRank);

            const stakeAmount = "1.0";

            // Stake structure:
            // address addr;
            // address addr;
            // uint8 id;
            // bytes32 name;
            // uint256 liquidity; // a user's stake
            const fromStake = [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(stakeAmount)];
            const toStake = [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther(stakeAmount)];

            expect(+(await leaderboard.getRankChangedNormalizedCoefficient(fromStake))).to.equal(90);
            expect(+(await leaderboard.getRankChangedNormalizedCoefficient(toStake))).to.equal(110);
        });

        it("should calculate the correct weight for a ranking", async function () {
            const {leaderboard, addr1} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const fromRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 4,
                startingRank: 3,
                data: []
            };

            const toRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 3,
                startingRank: 4,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A different name"),
                rank: 5,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const addRankingTx = await leaderboard.addRanking(testRanking.rank, testRanking.name, testRanking.data);
            await addRankingTx.wait();

            const updateRankingTx = await leaderboard.swapRank(fromRanking.id, fromRanking.rank, testRanking.id, testRanking.rank);
            await updateRankingTx.wait();

            const testStakes = [
                [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[0])],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[1])],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[2])],
                [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[3])],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[4])],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[5])],
            ];

            const fromRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[0]);
            const toRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[1]);
            const testRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[2]);

            // console.log(fromRankingChanged.toNumber()); // => 80, lost 2 ranks ✓ (starting - 3, current - 5)
            // console.log(toRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 4, current - 3)
            // console.log(testRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 5, current - 4)

            const rankingsChanged = {
                [fromRanking.id]: fromRankingChanged,
                [toRanking.id]: toRankingChanged,
                [testRanking.id]: testRankingChanged
            };

            const expectedWeights = testStakes.map(stake => {
                //  liquidity * normalized coeffiicient / 100
               return BigNumber.from(stake[3]).mul(rankingsChanged[stake[1]]).div(100);
            });

            // console.log(expectedWeights);
            // [
            //     BigNumber { _hex: '0x0d529ae9e8600000', _isBigNumber: true },
            //     BigNumber { _hex: '0x3d0ff0b013b80000', _isBigNumber: true },
            //     BigNumber { _hex: '0x2714711487800000', _isBigNumber: true },
            //     BigNumber { _hex: '0x1636eda28e058000', _isBigNumber: true },
            //     BigNumber { _hex: '0x7bf4d6ad1dca0000', _isBigNumber: true },
            //     BigNumber { _hex: '0x0e61b674532f6000', _isBigNumber: true }
            // ]

            // console.log(expectedWeights.map(w => w.toString()));
            // [
            //     '960000000000000000',
            //     '4400000000000000000',
            //     '2816000000000000000',
            //     '1600728000000000000',
            //     '8932000000000000000',
            //     '1036310000000000000'
            // ]

            for (let i = 0; i < testStakes.length; i++) {
                expect(await leaderboard.calculateWeight(testStakes[i])).to.equal(expectedWeights[i]);
            }
        });

        it("should revert if an unchanged rank tries to get a changed rank normalized coefficient", async function () {
            const {leaderboard, addr1} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const unchangedRanking = {
                id: 5,
                name: ethers.utils.formatBytes32String("unchanged"),
                rank: 22,
                startingRank: 22,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const addRankingTx = await leaderboard.addRanking(unchangedRanking.rank, unchangedRanking.name, unchangedRanking.data);
            await addRankingTx.wait();

            const stakeAmount = "1.0";
            const unchangedStake = [addr1.address, unchangedRanking.id, unchangedRanking.name, ethers.utils.parseEther(stakeAmount)];

            await expect(leaderboard.getRankChangedNormalizedCoefficient(unchangedStake))
                .to.be.revertedWith("UnchangedRankShouldNeverReceiveACoefficient");
        });

        it("should calculate the right norm for the reward pool", async function () {
            const {leaderboard, addr1, addr2, addr3} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const fromRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                startingRank: 3,
                data: []
            };

            const toRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 3,
                startingRank: 4,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A different name"),
                rank: 4,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testStakes = [
                [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[0])],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[1])],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[2])],
                [addr2.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[3])],
                [addr2.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[4])],
                [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[5])],
                [addr3.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[6])],
                [addr3.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[7])],
                [addr3.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[8])],
            ];

            const accounts = {
                [addr1.address] : addr1,
                [addr2.address] : addr2,
                [addr3.address] : addr3,
            };

            for (let i = 0; i < testStakes.length; i++) {
                const tx = await leaderboard.connect(accounts[testStakes[i][0]]).addStake(testStakes[i][1], testStakes[i][2], {value: testStakes[i][3]});
                await tx.wait();
            }

            const fromRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[0]);
            const toRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[1]);
            const testRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[2]);

            // console.log(fromRankingChanged.toNumber()); // => 80, lost 2 ranks ✓ (starting - 3, current - 5)
            // console.log(toRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 4, current - 3)
            // console.log(testRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 5, current - 4)

            const rankingsChanged = {
                [fromRanking.id]: fromRankingChanged,
                [toRanking.id]: toRankingChanged,
                [testRanking.id]: testRankingChanged
            };

            const expectedWeights = testStakes.map(stake => {
                //  liquidity * normalized coeffiicient / 100
                return BigNumber.from(stake[3]).mul(rankingsChanged[stake[1]]).div(100);
            });

            const rewardPool = await leaderboard.rewardPool();
            const poolAmount = rewardPool.sub(ethers.utils.parseEther("2.0"));
            // console.log("Pool Amount: ", poolAmount.toString()); // 24408310000000000000

            const sumOfExpectedWeights = expectedWeights.reduce((acc, cur, i) => {
                acc = acc.add(cur);
                return acc;
            }, BigNumber.from(0));
            // console.log("Sum of Expected Weights: ", sumOfExpectedWeights.toString()); // 24965618000000000000

            const norm = poolAmount.mul(precision).div(sumOfExpectedWeights);
            // console.log("Norm: ", norm.toString()); // 977676979
            // console.log(977676979 / 1000000000) // 0.977676979
            // console.log(24408310000000000000 / 24965618000000000000); // 0.9776769795964995

            expect(await leaderboard.calculateNorm(testStakes, poolAmount)).to.equal(norm);
        });

        it("should calculate the right norm for the initial funding", async function () {
            const {leaderboard, addr1, addr2, addr3} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const fromRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                startingRank: 3,
                data: []
            };

            const toRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 3,
                startingRank: 4,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A different name"),
                rank: 4,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testStakes = [
                // [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[0])],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[1])],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[2])],
                // [addr2.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[3])],
                [addr2.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[4])],
                [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[5])],
                // [addr3.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[6])],
                [addr3.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[7])],
                [addr3.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[8])],
            ];

            const fromRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[0]);
            const toRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[1]);
            const testRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[2]);

            // console.log(fromRankingChanged.toNumber()); // => 80, lost 2 ranks ✓ (starting - 3, current - 5)
            // console.log(toRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 4, current - 3)
            // console.log(testRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 5, current - 4)

            const rankingsChanged = {
                [fromRanking.id]: fromRankingChanged,
                [toRanking.id]: toRankingChanged,
                [testRanking.id]: testRankingChanged
            };

            const expectedWeights = testStakes.map(stake => {
                //  liquidity * normalized coeffiicient / 100
                return BigNumber.from(stake[3]).mul(rankingsChanged[stake[1]]).div(100);
            });

            const poolAmount = ethers.utils.parseEther("2.0");
            // console.log("Pool Amount: ", poolAmount.toString()); // 2000000000000000000

            const sumOfExpectedWeights = expectedWeights.reduce((acc, cur, i) => {
                acc = acc.add(cur);
                return acc;
            }, BigNumber.from(0));
            // console.log("Sum of Expected Weights: ", sumOfExpectedWeights.toString()); // 19876890000000000000

            const norm = poolAmount.mul(precision).div(sumOfExpectedWeights);
            // console.log("Norm: ", norm.toString()); // 100619362
            // console.log(100619362 / 1000000000) // 0.100619362
            // console.log(2000000000000000000 / 19876890000000000000); // 0.10061936248578122

            expect(await leaderboard.calculateNorm(testStakes, poolAmount)).to.equal(norm);
        });

        it("should allocate stake rewards correctly", async function () {
            const {leaderboard, addr1, addr2, addr3} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const addr1Balance = await addr1.getBalance();
            const addr2Balance = await addr2.getBalance();
            const addr3Balance = await addr3.getBalance();

            const fromRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                startingRank: 3,
                data: []
            };

            const toRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 3,
                startingRank: 4,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A different name"),
                rank: 4,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const commissionFee = 0.0025;
            const initialFunding = "2.0";

            const testStakes = [
                [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther((+originalStakeAmounts[0] - commissionFee) + "")],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther((+originalStakeAmounts[1] - commissionFee) + "")],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther((+originalStakeAmounts[2] - commissionFee)  + "")],
                [addr2.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther((+originalStakeAmounts[3] - commissionFee)  + "")],
                [addr2.address, toRanking.id, toRanking.name, ethers.utils.parseEther((+originalStakeAmounts[4] - commissionFee)  + "")],
                [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther((+originalStakeAmounts[5] - commissionFee)  + "")],
                [addr3.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther((+originalStakeAmounts[6] - commissionFee)  + "")],
                [addr3.address, toRanking.id, toRanking.name, ethers.utils.parseEther((+originalStakeAmounts[7] - commissionFee)  + "")],
                [addr3.address, testRanking.id, testRanking.name, ethers.utils.parseEther((+originalStakeAmounts[8] - commissionFee) + "")],
            ];
            // Total: 24.40831
            console.log("Original stakes: ", originalStakeAmounts);

            const fromRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[0]);
            const toRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[1]);
            const testRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[2]);

            // console.log(fromRankingChanged.toNumber()); // => 80, lost 2 ranks ✓ (starting - 3, current - 5)
            // console.log(toRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 4, current - 3)
            // console.log(testRankingChanged.toNumber()); // => 110, gain 1 rank ✓ (starting - 5, current - 4)

            const rankingsChanged = {
                [fromRanking.id]: fromRankingChanged,
                [toRanking.id]: toRankingChanged,
                [testRanking.id]: testRankingChanged
            };

            const expectedWeights = testStakes.map(stake => {
                //  liquidity * normalized coeffiicient / 100
                return BigNumber.from(stake[3])
                    .mul(rankingsChanged[stake[1]]).div(100);
            });

            const rewardPool = await leaderboard.rewardPool();
            const poolAmount = rewardPool.sub(ethers.utils.parseEther(initialFunding));
            console.log("Pool Amount: ", ethers.utils.formatEther(poolAmount)); // 24.40831

            const sumOfExpectedWeights = expectedWeights.reduce((acc, cur, i) => {
                acc = acc.add(cur);
                return acc;
            }, BigNumber.from(0));
            console.log("Sum of Expected Weights: ", ethers.utils.formatEther(sumOfExpectedWeights)); // 24.94311800000000027

            const norm = poolAmount.mul(precision).div(sumOfExpectedWeights);
            const calculatedNormFromContract = await leaderboard.calculateNorm(testStakes, poolAmount);
            expect(calculatedNormFromContract, "Norm is not equal").to.equal(norm);

            const expectedReturnValues = expectedWeights.map(w => {
                return ethers.utils.formatEther(w.mul(norm).div(precision));
            });

            const total = expectedReturnValues.reduce((acc, cur, i) => {
                acc = +acc + +cur;
                return acc;
            }, 0);

            // Weights
            console.log("Expected weights: ", expectedWeights.map(w => ethers.utils.formatEther(w)));
            // [
            //   '0.958',
            //   '4.39725',
            //   '2.81325',
            //   '1.59872800000000016',
            //   '8.92925',
            //   '1.03356000000000011',
            //   '2.526',
            //   '1.82325',
            //   '0.86383'
            // ]

            // Calculated norm from contract
            console.log("Norm calculated from contract (before multiplying by the precision)", ethers.utils.formatEther(calculatedNormFromContract));
            console.log("Norm: ", norm / precision) // 0.97855889548
            // Calculated norm from taking reward pool divided by sum of all weights
            console.log("Norm calculated from reward pool / sumOfAllWeights: ", total / +ethers.utils.formatEther(sumOfExpectedWeights)); // 0.9785588954799999

            // Amount returned by contract = weight * norm = rankingChanged * liquidityStaked * norm
            console.log("Expected return values: ", expectedReturnValues);
            // [
            //   '0.93745942186984', // originally staked 1.2 ETH - .0025 ETH, rank decreased by 2, returns 0.93745942186984 ETH, net change = - 0.26254057813015996
            //   '4.30296810314943', // originally staked 4.0 ETH - .0025 ETH, rank increased by 1, returns 4.30296810314943 ETH, net change = + 0.30296810314943023
            //   '2.75293081270911',
            //   '1.564449505852949596',
            //   '8.73779701746479',
            //   '1.011399332012308907',
            //   '2.47183976998248',
            //   '1.78415750618391',
            //   '0.8453085306824884'
            // ]

            console.log("Total", total); // 24.408309999837737

            const netChange = originalStakeAmounts.map((a, i) => {
               return expectedReturnValues[i] - +a;
            });

            console.log("Net Change: ", netChange);
            // [
            //  -0.26254057813015996,
            //  0.30296810314943023,
            //  0.19293081270910983,
            //  -0.4364604941470507,
            //  0.61779701746479,
            //  0.06929933201230887,
            //  -0.68816023001752,
            //  0.12415750618390997,
            //  0.0575085306824884
            // ]

            const testStakesTotalValue = ethers.utils.formatEther(testStakes.reduce((acc: any, cur: any) => {
                acc = acc.add(cur[3]);
                return acc;
            }, BigNumber.from(0)));
            console.log("Test stakes total value: ", testStakesTotalValue);
            // Total: 24.4083100000000003

            const netChangedSum = netChange.reduce((acc, cur) => {
                acc = acc + cur;
                return acc;
            }, 0);
            // The sum of the net change will always be the total commission collected by the contract.
            // console.log("Net Changed Sum: ", netChangedSum); // -0.022500000162262057
            expect(Math.round(netChangedSum * 1000000) / 1000000).to.be.equal(- (Math.round(commissionFee * testStakes.length * 1000000)) / 1000000);

            // const allocateStakesTxPromise = await leaderboard.allocateStakeRewards();
            // const allocateStakesTx = await allocateStakesTxPromise.wait();
            // const events = allocateStakesTx.events;

            // events.forEach(e => {
            //     if (e.args['_reward']) {
            //         console.log("Reward: ", e.args['_reward']);
            //         console.log("Return value: ", ethers.utils.parseEther(expectedReturnValues[3]))
            //         console.log(ethers.utils.formatEther(e.args['_reward']));
            //     }
            // });

            // These tests cases for the SuccessfullyAllocatedRewardTo event are unreliable as they suffer from rounding errors,
            // and you can't set a range for acceptable deviations from the expected return value. Manually checking the values
            // shows that the rewards allocated are basically the same as the expected return values.
            await expect(leaderboard.allocateStakeRewards())
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .withArgs(addr1.address, BigNumber.from(ethers.utils.parseEther(expectedReturnValues[0])))
                .to.emit(leaderboard, "UserStakeFulfilled")
                .withArgs(addr1.address, testStakes[0])
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .withArgs(addr1.address, ethers.utils.parseEther(expectedReturnValues[1]))
                .to.emit(leaderboard, "UserStakeFulfilled")
                .withArgs(addr1.address, testStakes[1])
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .withArgs(addr1.address, ethers.utils.parseEther(expectedReturnValues[2]))
                .to.emit(leaderboard, "UserStakeFulfilled")
                .withArgs(addr1.address, testStakes[2])

                // .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                // .withArgs(addr2.address, ethers.utils.parseEther(expectedReturnValues[3]))
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .withArgs(addr2.address, ethers.utils.parseEther(expectedReturnValues[4]))
                .to.emit(leaderboard, "UserStakeFulfilled")
                .withArgs(addr2.address, testStakes[4])
                // .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                // .withArgs(addr2.address, ethers.utils.parseEther(expectedReturnValues[5]))

                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .withArgs(addr3.address, ethers.utils.parseEther(expectedReturnValues[6]))
                .to.emit(leaderboard, "UserStakeFulfilled")
                .withArgs(addr3.address, testStakes[6])
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .withArgs(addr3.address, ethers.utils.parseEther(expectedReturnValues[7]))
                .to.emit(leaderboard, "UserStakeFulfilled")
                .withArgs(addr3.address, testStakes[7])
                // .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                // .withArgs(addr3.address, ethers.utils.parseEther(expectedReturnValues[8]));

            const postAddr1Balance = await addr1.getBalance();
            const postAddr2Balance = await addr2.getBalance();
            const postAddr3Balance = await addr3.getBalance();

            // Getting rid of rounding errors... Would need to do all javascript calculations with BigNumber in order to
            // get rid of this issue.
            // 100,000 wei = ~0.00000000013 USD
            expect(postAddr1Balance.div(100000)).to.equal(
                addr1Balance
                    .add(ethers.utils.parseEther(expectedReturnValues[0]))
                    .add(ethers.utils.parseEther(expectedReturnValues[1]))
                    .add(ethers.utils.parseEther(expectedReturnValues[2]))
                    .div(100000)
            );

            expect(postAddr2Balance.div(100000)).to.equal(
                addr2Balance
                    .add(ethers.utils.parseEther(expectedReturnValues[3]))
                    .add(ethers.utils.parseEther(expectedReturnValues[4]))
                    .add(ethers.utils.parseEther(expectedReturnValues[5]))
                    .div(100000)
            );

            expect(postAddr3Balance.div(100000)).to.equal(
                addr3Balance
                    .add(ethers.utils.parseEther(expectedReturnValues[6]))
                    .add(ethers.utils.parseEther(expectedReturnValues[7]))
                    .add(ethers.utils.parseEther(expectedReturnValues[8]))
                    .div(100000)
            );

            expect((await leaderboard.getStakeRewardsToCalculate()).length).to.equal(0);
            expect(await leaderboard.userStakesSize()).to.equal(0);
            const expectedRewardPool = ethers.utils.parseEther(""+(+initialFunding + commissionFee *  testStakes.length)); // Initial funding plus commission fees
            const balance = await waffle.provider.getBalance(leaderboard.address);
            expect(balance.div(100000000), "Contract balance does not equal the expected reward pool.").to.equal(expectedRewardPool.div(100000000));
        });

        it("should allocate initial funding rewards correctly", async function () {
            const {leaderboard, addr1, addr2, addr3} = await loadFixture(deployAllocateRewardFixture);
            expect(await leaderboard.leaderboardName()).to.equal(ethers.utils.formatBytes32String("Allocate Reward Fixture"));

            const addr1Balance = await addr1.getBalance();
            const addr2Balance = await addr2.getBalance();
            const addr3Balance = await addr3.getBalance();

            const fromRanking = {
                id: 2,
                name: ethers.utils.formatBytes32String("Someone"),
                rank: 5,
                startingRank: 3,
                data: []
            };

            const toRanking = {
                id: 3,
                name: ethers.utils.formatBytes32String("A name"),
                rank: 3,
                startingRank: 4,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const testRanking = {
                id: 4,
                name: ethers.utils.formatBytes32String("A different name"),
                rank: 4,
                startingRank: 5,
                data: [...Buffer.from("Some random string of data converted into bytes")]
            };

            const commissionFee = 0.0025;
            const initialFunding = "2.0";

            const accounts = {
                [addr1.address] : addr1,
                [addr2.address] : addr2,
                [addr3.address] : addr3,
            };

            const addStakes = [
                [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[0])],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[1])],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[2])],
                [addr2.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[3])],
                [addr2.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[4])],
                [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[5])],
                [addr3.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther(originalStakeAmounts[6])],
                [addr3.address, toRanking.id, toRanking.name, ethers.utils.parseEther(originalStakeAmounts[7])],
                [addr3.address, testRanking.id, testRanking.name, ethers.utils.parseEther(originalStakeAmounts[8])],
            ];
            // Total: 24.40831

            for (let i = 0; i < addStakes.length; i++) {
                const tx = await leaderboard.connect(accounts[addStakes[i][0]]).addStake(addStakes[i][1], addStakes[i][2], {value: addStakes[i][3]});
                await tx.wait();
            }

            const testStakes = [
                [addr1.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther((+originalStakeAmounts[0] - commissionFee) + "")],
                [addr1.address, toRanking.id, toRanking.name, ethers.utils.parseEther((+originalStakeAmounts[1] - commissionFee) + "")],
                [addr1.address, testRanking.id, testRanking.name, ethers.utils.parseEther((+originalStakeAmounts[2] - commissionFee)  + "")],
                [addr2.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther((+originalStakeAmounts[3] - commissionFee)  + "")],
                [addr2.address, toRanking.id, toRanking.name, ethers.utils.parseEther((+originalStakeAmounts[4] - commissionFee)  + "")],
                [addr2.address, testRanking.id, testRanking.name, ethers.utils.parseEther((+originalStakeAmounts[5] - commissionFee)  + "")],
                [addr3.address, fromRanking.id, fromRanking.name, ethers.utils.parseEther((+originalStakeAmounts[6] - commissionFee)  + "")],
                [addr3.address, toRanking.id, toRanking.name, ethers.utils.parseEther((+originalStakeAmounts[7] - commissionFee)  + "")],
                [addr3.address, testRanking.id, testRanking.name, ethers.utils.parseEther((+originalStakeAmounts[8] - commissionFee) + "")],
            ];

            const fromRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[0]);
            const toRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[1]);
            const testRankingChanged = await leaderboard.getRankChangedNormalizedCoefficient(testStakes[2]);

            const rankingsChanged = {
                [fromRanking.id]: fromRankingChanged,
                [toRanking.id]: toRankingChanged,
                [testRanking.id]: testRankingChanged
            };

            const filteredStakes = testStakes.filter(stake => {
                return rankingsChanged[stake[1]] > 100;
            });

            const expectedWeights = filteredStakes.map(stake => {
                //  liquidity * normalized coeffiicient / 100
                return BigNumber.from(stake[3])
                    .mul(rankingsChanged[stake[1]]).div(100);
            });

            console.log("Expected weights: ", expectedWeights.map(e => ethers.utils.formatEther(e)));

            const sumOfExpectedWeights = expectedWeights.reduce((acc, cur, i) => {
                acc = acc.add(cur);
                return acc;
            }, BigNumber.from(0));
            console.log("Sum of Expected Weights: ", ethers.utils.formatEther(sumOfExpectedWeights)); // 19.86039000000000011

            const norm = ethers.utils.parseEther(initialFunding).mul(precision).div(sumOfExpectedWeights);
            console.log("Norm: ", norm / precision);
            console.log("Norm calculated from contract: ", ethers.utils.formatEther(await leaderboard.calculateNorm(filteredStakes, ethers.utils.parseEther(initialFunding))));
            expect(await leaderboard.calculateNorm(filteredStakes, ethers.utils.parseEther(initialFunding)), "Norm is not equal").to.equal(norm);

            const expectedReturnValues = expectedWeights.map(w => {
                return ethers.utils.formatEther(w.mul(norm).div(precision));
            });
            console.log("Expected return values: ", expectedReturnValues);

            const total = expectedReturnValues.reduce((acc, cur, i) => {
                acc = +acc + +cur;
                return acc;
            }, 0);
            console.log("Total expected return: ", total);

            const filteredOriginalAmounts = filteredStakes.map(s => {
               return ethers.utils.formatEther(s[3]);
            });
            console.log("Filtered original amounts", filteredOriginalAmounts);

            const filteredStakesTotalValue = ethers.utils.formatEther(filteredStakes.reduce((acc: any, cur: any) => {
                acc = acc.add(cur[3]);
                return acc;
            }, BigNumber.from(0)));
            console.log("Filtered test stakes total value: ", filteredStakesTotalValue);
            // Total: 24.4083100000000003

            const expectedTotalReturn = expectedReturnValues.map((e, i) => {
                return +e + +filteredOriginalAmounts[i];
            });
            console.log("Expected total returns: ", expectedTotalReturn);

            const allocateTxPromise = await leaderboard.allocateInitialFundingReward();
            const allocateTx = await allocateTxPromise.wait();

            // allocateTx.events.forEach(e => {
            //     if (e.args['_reward']) {
            //         console.log("User: ", e.args['_user']);
            //         console.log("Reward: ", ethers.utils.formatEther(e.args['_reward']));
            //     }
            // });

            await expect(leaderboard.allocateInitialFundingReward())
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo")
                .to.emit(leaderboard, "SuccessfullyAllocatedRewardTo");

            expect((await leaderboard.getInitialFundingRewardsToCalculate()).length).to.equal(0);
            expect(await leaderboard.userStakesSize()).to.equal(3); // 3 test stakes that did not get added into the initial funding rewards

            // const expectedRewardPool = ethers.utils.parseEther(""+(+initialFunding + commissionFee *  testStakes.length)); // Initial funding plus commission fees
            // const balance = await waffle.provider.getBalance(leaderboard.address);
            // expect(balance.div(100000000), "Contract balance does not equal the expected reward pool.").to.equal(expectedRewardPool.div(100000000));
        });

        it("should withdraw for users stakes where its ranking didn't change", async function () {

        });

        it("should remove stakes from userStakes after initialFundingRewardsToCalculate stakes have been allocated", async function () {

        });
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

        await expect(leaderboard.connect(addr1).addStake(testRanking1.id, testRanking1.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr1.address, [addr1.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr1).addStake(testRanking2.id, testRanking2.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr1.address, [addr1.address, testRanking2.id, testRanking2.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr2).addStake(testRanking1.id, testRanking1.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr2.address, [addr2.address, testRanking1.id, testRanking1.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr2).addStake(testRanking2.id, testRanking2.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
            .to.emit(leaderboard, "UserStakeAdded")
            .withArgs(addr2.address, [addr2.address, testRanking2.id, testRanking2.name, ethers.utils.parseEther(stakeAmount)]);

        await expect(leaderboard.connect(addr3).addStake(testRanking1.id, testRanking1.name, {value: BigNumber.from(ethers.utils.parseEther(stakeAmount)).add(commissionFee)}))
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