// SPDX-License-Identifier: MIT
//
//                         ..::----====++++====----::..
//                     .:-+#%%%%%%%%%%%%%%%%%%%%%%%%#+-:.
//                  .:-*@@@@@@@#+-.      .-+#@@@@@@@*-:.
//               .:-#@@@@@@@+:    .+#SYBL#.    :+@@@@@@@#-:.
//            .:-%@@@@@@*.     =+#KYC-GATE#+=     .*@@@@@@%-:.
//          .:-#@@@@@@+    .-*#%+:.      .:+#%#-.    +@@@@@@#-:.
//        .:-#@@@@@#    +#############################+    #@@@@@#-:.
//       .-=@@@@@@+    |  +------------------------+  |    +@@@@@@=-.
//       =%@@@@@@:    |  |   hasChainPermission    |  |    :@@@@@@%=
//       *@@@@@@@:    |  |   .------mint------.    |  |    :@@@@@@@*
//       #@@@@@@@:    |  |   |  KYC  |  GATE  |    |  |    :@@@@@@@#
//       #@@@@@@@:    |  |   '-----transfer-----'   |  |    :@@@@@@@#
//       *@@@@@@@:    |  +------------------------+  |    :@@@@@@@*
//       =%@@@@@@:    |  |      Anti-Bot · RBNT      |  |    :@@@@@@%=
//       .-=@@@@@@+    |  +------------------------+  |    +@@@@@@=-.
//        .:-#@@@@@#    +#############################+    #@@@@@#-:.
//          .:-#@@@@@@+                            +@@@@@@#-:.
//            .:-%@@@@@@*.                    .*@@@@@@%-:.
//               .:-#@@@@@@@+:            :+@@@@@@@#-:.
//                  .:-*@@@@@@@#++++++++#@@@@@@@*-:.
//                     .:-+#%%%%%%%%%%%%%%%%#+-:.
//                         ''::------------::''
//
//           Sybil-Proof ERC-20  *  Redbelly Network  *  Task 01  *  Chain 153
//                                    @1F592
//
/**
 * @title SybilProofToken
 * @notice KYC-gated ERC-20: minting always requires chain permission;
 *         transfers optionally gated via hasChainPermission.
 * @custom:task Redbelly DAO Task 1 — Anti-Bot Standard
 */
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPermissionChecker.sol";

/// @title SybilProofToken
/// @notice KYC-gated ERC-20: minting always requires chain permission; transfers optionally gated.
contract SybilProofToken is ERC20, Ownable {
    IPermissionChecker public permissionChecker;
    bool public transferGated;

    /// @notice Recipient lacks KYC / chain permission required for minting.
    error KycVerificationRequiredForMint(address recipient);

    /// @notice Sender or recipient lacks KYC / chain permission required for transfer.
    error KycVerificationRequiredForTransfer(address from, address to);

    /// @notice Eligibility checker address cannot be zero.
    error InvalidEligibilityCheckerAddress();

    event TransferGateUpdated(bool transferGated);
    event EligibilityCheckerUpdated(
        address indexed previousChecker,
        address indexed newChecker
    );

    constructor(
        string memory name_,
        string memory symbol_,
        address eligibilityChecker_,
        bool transferGated_
    ) ERC20(name_, symbol_) {
        _setPermissionChecker(eligibilityChecker_);
        transferGated = transferGated_;
    }

    /// @notice Mint tokens to caller when they have chain permission (reviewer self-test path).
    function mint(uint256 amount) external {
        if (!permissionChecker.hasChainPermission(msg.sender)) {
            revert KycVerificationRequiredForMint(msg.sender);
        }
        _mint(msg.sender, amount);
    }

    /// @notice Owner mints to a recipient; KYC gate on recipient — owner cannot bypass.
    function mintTo(address to, uint256 amount) external onlyOwner {
        if (!permissionChecker.hasChainPermission(to)) {
            revert KycVerificationRequiredForMint(to);
        }
        _mint(to, amount);
    }

    /// @notice Toggle whether transfers require KYC on both sender and recipient.
    function setTransferGated(bool gated) external onlyOwner {
        transferGated = gated;
        emit TransferGateUpdated(gated);
    }

    /// @notice Update the eligibility checker contract (e.g. after Bootstrap upgrade).
    function setPermissionChecker(address checker) external onlyOwner {
        _setPermissionChecker(checker);
    }

    function _setPermissionChecker(address checker) internal {
        if (checker == address(0)) revert InvalidEligibilityCheckerAddress();
        address previous = address(permissionChecker);
        permissionChecker = IPermissionChecker(checker);
        emit EligibilityCheckerUpdated(previous, checker);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (from != address(0) && transferGated) {
            if (!permissionChecker.hasChainPermission(from)) {
                revert KycVerificationRequiredForTransfer(from, to);
            }
            if (to != address(0) && !permissionChecker.hasChainPermission(to)) {
                revert KycVerificationRequiredForTransfer(from, to);
            }
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}
