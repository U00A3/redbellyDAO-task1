import { useHasChainPermission } from "@redbellynetwork/eligibility-sdk";
import {
  EXPLORER_URL,
  REBELLY_ACCESS_URL,
  TESTNET_PERMISSION_ADDRESS,
} from "../config/wagmi";

export default function EligibilityStatus({ address, compact = false }) {
  const { data: isAllowed, isLoading, refetch } = useHasChainPermission(address);

  if (compact) {
    if (isLoading) {
      return <span className="status-badge neutral">Checking KYC…</span>;
    }
    return (
      <span className={`status-badge ${isAllowed ? "ok" : "warn"}`}>
        {isAllowed ? "✓ KYC verified" : "✕ KYC required"}
      </span>
    );
  }

  if (isLoading) {
    return (
      <div className="cat-status-card loading">
        <div>
          <div className="cat-label">
            Chain permission (KYC)
            <span className="cat-network-tag">Testnet</span>
          </div>
          <div className="cat-desc">Checking hasChainPermission via Permission registry…</div>
        </div>
        <span className="status-badge neutral">Checking…</span>
      </div>
    );
  }

  return (
    <div className={`cat-status-card ${isAllowed ? "allowed" : "denied"}`}>
      <div>
        <div className="cat-label">
          Chain permission (KYC)
          <span className="cat-network-tag">Testnet · 153</span>
        </div>
        <div className="cat-desc">
          {isAllowed ? (
            <>
              Wallet has chain permission (<code>hasChainPermission</code> = true). Minting and
              gated transfers are allowed for this address.
            </>
          ) : (
            <>
              Wallet lacks KYC / testnet permission. Complete onboarding via{" "}
              <a href={REBELLY_ACCESS_URL} target="_blank" rel="noreferrer">
                Redbelly Access
              </a>{" "}
              then{" "}
              <button type="button" className="link-button" onClick={() => refetch()}>
                refresh status
              </button>
              . Permission registry:{" "}
              <a
                href={`${EXPLORER_URL}/address/${TESTNET_PERMISSION_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                {TESTNET_PERMISSION_ADDRESS.slice(0, 6)}…
                {TESTNET_PERMISSION_ADDRESS.slice(-4)}
              </a>
            </>
          )}
        </div>
      </div>
      <span className={`status-badge ${isAllowed ? "ok" : "warn"}`}>
        {isAllowed ? "✓ Verified" : "✕ Not verified"}
      </span>
    </div>
  );
}
