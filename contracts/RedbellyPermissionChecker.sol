// SPDX-License-Identifier: MIT
//
//                  .:-+#PERM#+-:.
//               .:-*CHECKER*-:.
//            .:-#@ Bootstrap @#-:.
//         .:-#@  Permission  @#-:.
//            .:-#@ isAllowed @#-:.
//               .:-* chain  *-:.
//                  .:-+#153#+-:.
//
//        RedbellyPermissionChecker  ·  Eligibility SDK adapter
//                                    @1F592
//
/**
 * @title RedbellyPermissionChecker
 * @notice Resolves Permission via Bootstrap; exposes hasChainPermission for SYBL.
 */
pragma solidity ^0.8.24;

import "./interfaces/IPermissionChecker.sol";
import "./interfaces/IBootstrap.sol";

interface IPermission {
    function isAllowed(address account) external view returns (bool);
}

/// @notice Production checker — resolves Permission via Bootstrap on Redbelly testnet/mainnet.
contract RedbellyPermissionChecker is IPermissionChecker {
    address public immutable permission;

    constructor(address bootstrap) {
        permission = IBootstrap(bootstrap).getContractAddress("permission");
        require(permission != address(0), "Permission not configured");
    }

    function hasChainPermission(address account) external view returns (bool) {
        return IPermission(permission).isAllowed(account);
    }
}
