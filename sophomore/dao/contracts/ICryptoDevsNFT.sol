// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICryptoDevsNFT {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256) external view returns (uint256);
}