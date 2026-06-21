// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IPermissionChecker.sol";

/// @dev Local/test helper — toggles KYC permission per address for integration tests.
contract MockPermissionChecker is IPermissionChecker {
    mapping(address => bool) private _allowed;

    function setPermission(address account, bool allowed) external {
        _allowed[account] = allowed;
    }

    function setPermissions(address[] calldata accounts, bool allowed) external {
        uint256 len = accounts.length;
        for (uint256 i; i < len; ) {
            _allowed[accounts[i]] = allowed;
            unchecked {
                ++i;
            }
        }
    }

    function hasChainPermission(address account) external view returns (bool) {
        return _allowed[account];
    }

    /// @dev Alias for Permission.isAllowed — used by RedbellyPermissionChecker tests.
    function isAllowed(address account) external view returns (bool) {
        return _allowed[account];
    }
}
