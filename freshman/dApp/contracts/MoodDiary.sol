// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract MoodDiary {
    // state variable
    string mood;

    // function that writes a mood to the mood state variable
    function setMood(string memory _mood) public {
        mood = _mood;
    }

    // function that reads the mood from mood state variable
    function getMood() public view returns(string memory) {
        return mood;
    }
}