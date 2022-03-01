const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MoodDiary", async function () {
  it("Should get empty string after deployment", async function () {
    // deploy contract
    const MoodDiary = await hre.ethers.getContractFactory("MoodDiary");
    const moodDiary = await MoodDiary.deploy();
    await moodDiary.deployed();

    expect(await moodDiary.getMood()).to.equal("");
  });

  it("Should set and get new mood", async () => {
    // deploy contract
    const MoodDiary = await hre.ethers.getContractFactory("MoodDiary");
    const moodDiary = await MoodDiary.deploy();
    await moodDiary.deployed();

    // init mood
    const mood = "Good!";

    // set mood
    const setMoodTx = await moodDiary.setMood(mood);
    await setMoodTx.wait();

    // get mood
    expect(await moodDiary.getMood()).to.equal(mood);
  });
});
