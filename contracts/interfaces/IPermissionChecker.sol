// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Eligibility gate used by SybilProofToken for mint and optional transfer checks.
/// On Redbelly, production checkers delegate to Permission.isAllowed via Bootstrap.
interface IPermissionChecker {
    function hasChainPermission(address account) external view returns (bool);
}
