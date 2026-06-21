// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IBootstrap.sol";

/// @dev Registers named contracts for local RedbellyPermissionChecker tests.
contract MockBootstrap is IBootstrap {
    mapping(string => address) private _contracts;

    function setContractAddress(string calldata name, address addr) external {
        _contracts[name] = addr;
    }

    function getContractAddress(string calldata name) external view returns (address) {
        return _contracts[name];
    }
}
