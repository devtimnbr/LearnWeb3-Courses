// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// create interface to check if address is whitelist 
// you can check the contract in ../whitelist-dApp/contracts/Whitelist.sol
interface IWhitelist {
    function whitelistedAddresses(address) external view returns (bool);
}

contract CryptoDevs is ERC721Enumerable, Ownable {
    /**
    * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
    * token will be the concatenation of the `baseURI` and the `tokenId`.
    */
    string _baseTokenURI;

    // price of the nft
    uint256 public _price = 0.002 ether;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused;

    // max number of tokens
    uint256 public maxTokenIds = 20;
    // total number of minted tokens
    uint256 public tokenIds;

    // Whitelist contract instance
    IWhitelist whitelist;

    // boolean to keep track of presale
    bool public presaleStarted;

    // timestamp for presale end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
    * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
    */

    constructor (string memory name, string memory symbol, string memory baseURI, address whitelistContract) payable ERC721(name, symbol)  {
        _baseTokenURI = baseURI;
        // init an instance of whitelist interface
        whitelist = IWhitelist(whitelistContract);
    }

    /**
    * @dev startPresale starts a presale for the whitelisted addresses
    */
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // Set presaleEnded time as current timestamp + 5 minutes
        presaleEnded = block.timestamp + 5 minutes;
    }

    /**
    * @dev presaleMint allows an user to mint one NFT per transaction during the presale.
    */
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not live");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
        require(tokenIds < maxTokenIds, "Exceeded maximum token supply");
        require(msg.value >= _price, "Ether sent is lower than mint price");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    /**
    * @dev mint allows an user to mint 1 NFT per transaction after the presale has ended.
    */
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "Exceeded maximum token supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    /**
    * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
    * returned an empty string for the baseURI
    */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
    * @dev setPaused makes the contract paused or unpaused
    */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /**
    * @dev withdraw sends all the ether in the contract
    * to the owner of the contract
    */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{ value: amount }("");
        require(sent, "Failed to send Ether");
    }

    // function to receive ether. msg.data must be empty
    receive() external payable {}
    // function is called when msg.data is not empty
    fallback() external payable {}
}