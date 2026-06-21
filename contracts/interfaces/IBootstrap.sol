// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBootstrap {
    function getContractAddress(string calldata name) external view returns (address);
}
