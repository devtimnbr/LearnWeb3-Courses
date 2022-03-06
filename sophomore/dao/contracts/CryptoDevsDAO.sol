// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevsNFT.sol";
import "./IFakeNFTMarketplace.sol";

struct Proposal {
    uint256 nftTokenId;
    // deadline - the UNIX timestamp until which this proposal is active. Proposal can be executed after the deadline has been exceeded.
    uint256 deadline;
    // yayVotes - number of yay votes for this proposal
    uint256 yayVotes;
    // nayVotes - number of nay votes for this proposal
    uint256 nayVotes;
    // executed - whether or not this proposal has been executed yet. Cannot be executed before the deadline has been exceeded.
    bool executed;
    // voters - a mapping of CryptoDevsNFT tokenIDs to booleans indicating whether that NFT has already been used to cast a vote or not
    mapping(uint256 => bool) voters;
}

// YAY = 0; NAY = 1
enum Vote {
    YAY,
    NAY
}

contract CryptoDevsDao is Ownable {
    // mapping of propasal ids
    mapping(uint256 => Proposal) public proposals;
    // number of proposals created
    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;

    // The payable allows this constructor to accept an ETH deposit when it is being deployed
    constructor(address _nftMarketPlace, address _cryptoDevsNFT) payable {
        nftMarketplace = IFakeNFTMarketplace(_nftMarketPlace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }

    modifier activeProposalOnly(uint256 proposalId) {
        require(proposals[proposalId].deadline > block.timestamp);
        _;
    }

    modifier inactiveProposalOnly(uint256 proposalId) {
        require(proposals[proposalId].deadline <= block.timestamp, "DEADLINE_NOT_EXCEEDED");
        require(proposals[proposalId].executed == false, "PROPOSAL_ALREADY_EXECUTED");
        _;
    }

    /// @dev createProposal allows a CryptoDevsNFT holder to create a new proposal in the DAO
    /// @param _nftTokenId - the tokenID of the NFT to be purchased from FakeNFTMarketplace if this proposal passes
    /// @return Returns the proposal index for the newly created proposal
    function createProposal(uint256 _nftTokenId) external nftHolderOnly returns (uint256) {
        require(nftMarketplace.available(_nftTokenId), "NFT_NOT_FOR_SALE");
        // use storage keyword because the proposal data will persist 
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        // Set the proposal's voting deadline to be (current time + 5 minutes)
        proposal.deadline = block.timestamp + 5 minutes;

        numProposals++;
        return numProposals - 1;
    }

    /* 
    * @dev voteOnProposal allows a CryptoDevsNFT holder to cast their vote on an active proposal
    * @param proposalIndex - the index of the proposal to vote on in the proposals array
    * @param vote - the type of vote they want to cast
    */
    function voteOnProposal(uint256 proposalId, Vote vote) external nftHolderOnly activeProposalOnly(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        uint256 voterNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 numVotes = 0;

        // Calculate how many NFTs are owned by the voter that haven't already been used for voting on this proposal
        for(uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if(!proposal.voters[tokenId]) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }

            require(numVotes > 0, "ALREADY_VOTED");

            if(vote == Vote.YAY) {
                proposal.yayVotes += numVotes;
            } else {
                proposal.nayVotes += numVotes;
            }
        }
    }

    /* 
    * @dev executeProposal allows any CryptoDevsNFT holder to execute a proposal after it's deadline has been exceeded
    * @param proposalIndex - the index of the proposal to execute in the proposals array
    */
    function executeProposal(uint256 proposalId) external nftHolderOnly inactiveProposalOnly(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        // purchase NFT from fake marketplace if more YAY votes
        if(proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = nftMarketplace.getPrice();
            require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
            nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }

        proposal.executed = true;
    }

    /// @dev withdrawEther allows the contract owner (deployer) to withdraw the ETH from the contract
    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // The following two functions allow the contract to accept ETH deposits
    // directly from a wallet without calling a function
    receive() external payable {}
    fallback() external payable {}
}