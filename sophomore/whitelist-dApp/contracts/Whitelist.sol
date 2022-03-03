//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

contract Whitelist {

    // max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    // Create a mapping of whitelisted addresses
    // if address is whitelist, set it to true - false by default for all other addresses
    mapping(address => bool) public whitelistedAddresses;

    // keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    // set maxWhitelistedAddresses in constructor
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    // add sender to whitelist
    function addAddressToWhitelist() public {
        // check if user has been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        // check if the numAddressesWhitelisted < maxWhitelistedAddresses, if not then throw an error
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses cant be added, limit reached");
        // add the msg.sender to whiteListedAddress hash map
        whitelistedAddresses[msg.sender] = true;
        // increase the number of whitelisted address
        numAddressesWhitelisted += 1;
    }
}
