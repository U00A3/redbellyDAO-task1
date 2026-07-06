import { useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useHasChainPermission } from "@redbellynetwork/eligibility-sdk";
import { CONTRACTS, TOKEN_ABI } from "../config/wagmi";
import { formatTokenAmount } from "../utils/format";
import EligibilityStatus from "./EligibilityStatus";

export default function TokenPanel() {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10");
  const [mintAmount, setMintAmount] = useState("100");

  const tokenAddress = CONTRACTS.token;
  const enabled = tokenAddress !== "0x0000000000000000000000000000000000000000";

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: enabled && !!address },
  });

  const { data: owner } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "owner",
    query: { enabled },
  });

  const { data: transferGated } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "transferGated",
    query: { enabled },
  });

  const { data: hasPermission, isLoading: permLoading } = useHasChainPermission(address);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const isOwner =
    owner && address && owner.toLowerCase() === address.toLowerCase();

  function mintSelf() {
    writeContract({
      address: tokenAddress,
      abi: TOKEN_ABI,
      functionName: "mint",
      args: [parseEther(mintAmount || "0")],
    });
  }

  function mintTo() {
    if (!recipient) return;
    writeContract({
      address: tokenAddress,
      abi: TOKEN_ABI,
      functionName: "mintTo",
      args: [recipient, parseEther(mintAmount || "0")],
    });
  }

  function transferTokens() {
    if (!recipient) return;
    writeContract({
      address: tokenAddress,
      abi: TOKEN_ABI,
      functionName: "transfer",
      args: [recipient, parseEther(amount || "0")],
    });
  }

  function toggleGate() {
    writeContract({
      address: tokenAddress,
      abi: TOKEN_ABI,
      functionName: "setTransferGated",
      args: [!transferGated],
    });
  }

  return (
    <div>
      <EligibilityStatus address={address} />

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-tile-label">Your balance</span>
          <span className="stat-tile-value">
            {balance !== undefined ? `${formatTokenAmount(balance)} SYBL` : "…"}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Can mint / transfer</span>
          <span
            className={`stat-tile-value stat-tile-value-sm ${
              permLoading ? "muted-text" : hasPermission ? "text-ok" : "text-warn"
            }`}
          >
            {permLoading ? "Checking…" : hasPermission ? "Yes (KYC ok)" : "No — complete KYC"}
          </span>
        </div>
      </div>

      <div className="deposit-card">
        <h3 className="panel-heading">Mint (KYC-gated)</h3>
        <p className="overview-lead">
          Any wallet may call <code>mint(amount)</code>. Reverts with{" "}
          <code>KycVerificationRequiredForMint</code> until chain permission is granted.
        </p>
        <label className="field-label">
          Amount (SYBL)
          <input
            className="field-input"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="100"
          />
        </label>
        <div className="action-row">
          <button
            type="button"
            className="btn-connect btn-sm"
            disabled={!enabled || isPending || confirming}
            onClick={mintSelf}
          >
            Mint to my wallet
          </button>
        </div>
        {!hasPermission && !permLoading && (
          <p className="footnote">
            Without KYC, mint will revert on-chain with{" "}
            <code>KycVerificationRequiredForMint(yourAddress)</code>. Complete onboarding, then
            retry.
          </p>
        )}
      </div>

      {isOwner && (
        <div className="deposit-card">
          <h3 className="panel-heading">Owner · mintTo (admin airdrop)</h3>
          <label className="field-label">
            Mint to address
            <input
              className="field-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x…"
            />
          </label>
          <button
            type="button"
            className="btn-connect btn-sm"
            disabled={!enabled || isPending || confirming || !recipient}
            onClick={mintTo}
          >
            Mint to recipient
          </button>
          <p className="footnote">
            Owner-only <code>mintTo</code> — recipient must still pass KYC; owner cannot bypass.
          </p>
        </div>
      )}

      <div className="deposit-card">
        <h3 className="panel-heading">Transfer</h3>
        <label className="field-label">
          Recipient
          <input
            className="field-input"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x…"
          />
        </label>
        <label className="field-label">
          Amount (SYBL)
          <input
            className="field-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10"
          />
        </label>
        <button
          type="button"
          className="btn-connect btn-sm"
          disabled={!enabled || isPending || confirming || !recipient || !balance}
          onClick={transferTokens}
        >
          Transfer
        </button>
        {transferGated && (
          <p className="footnote">
            Transfer gate is <strong>on</strong> — both parties need KYC. Reverts with{" "}
            <code>KycVerificationRequiredForTransfer</code> otherwise.
          </p>
        )}
      </div>

      {isOwner && (
        <div className="deposit-card">
          <h3 className="panel-heading">Owner · transfer gate</h3>
          <p className="overview-lead">
            Current: {transferGated ? "Gated (KYC required)" : "Ungated (open transfers)"}
          </p>
          <button
            type="button"
            className="btn-connect btn-sm"
            disabled={!enabled || isPending || confirming}
            onClick={toggleGate}
          >
            {transferGated ? "Disable transfer gate" : "Enable transfer gate"}
          </button>
        </div>
      )}

      {(isPending || confirming) && (
        <div className="step-loading">
          <div className="spinner" />
          <p>Waiting for transaction…</p>
        </div>
      )}
      {isSuccess && <p className="message-success">Transaction confirmed.</p>}
      {writeError && (
        <p className="message-warn">
          {writeError.shortMessage || writeError.message || "Transaction failed"}
        </p>
      )}
    </div>
  );
}
