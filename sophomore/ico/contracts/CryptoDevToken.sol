// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable {
    // price of one token
    uint256 public constant tokenPrice = 0.001 ether;
    // tokens you get for one nft
    uint256 public constant tokenPerNFT = 10 * 10**18;
    // max supply of 10.000 tokens
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    // CryptoDevsNFT contract instance
    ICryptoDevs CryptoDevsNFT;
    // mapping to keep track of which tokenIds have been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    /* 
    * @dev Mints amount number of tokens
    * Requirements: msg.value should be equal or greater than the tokenPrice * amount
    */
    function mint(uint256 amount) public payable {
        // value of ether should be greater or equal to tokenPrice * amount 
        require(msg.value >= tokenPrice * amount, "Ether sent is incorrect");
        // amount + totalSupply should be less than maxTotalSupply
        uint amountWithDecimals = amount * 10**18;
        require((totalSupply() + amountWithDecimals) <= maxTotalSupply, "Exceeds the max total supply available");
        // call internal function from Openzeppelin's ERC20 contract
        _mint(msg.sender, amountWithDecimals);
    }

    /* 
    * @dev Mints tokens based on the number of NFT's held by the sender
    * Requirements:
    * balance of Crypto Dev NFT's owned by the sender should be greater than 0
    * Tokens should have not been claimed for all the NFTs owned by the sender
    */
    function claim() public {
        // get the number of nfts hold by the sender
        uint256 balance = CryptoDevsNFT.balanceOf(msg.sender);
        // revert if balance is zero
        require(balance > 0, "You dont own any Crypto Dev NFT's");
        // amount keeps track of number of unclaimed tokenIds
        uint256 amount = 0;
        // loop over balance and get the tokenId owned by `sender` at a given `index` of its token list.
        for(uint256 i = 0; i < balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            // if tokenId has not been claimed, increase amount
            if(!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed all tokens");
        _mint(msg.sender, amount * tokenPerNFT);
    }

    // functions to receive ether
    receive() external payable {}
    fallback() external payable {}
}