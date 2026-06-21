import { useReadContract } from "wagmi";
import { CONTRACTS, EXPLORER_URL, TOKEN_ABI } from "../config/wagmi";
import { IconExplorer, IconExternalLink } from "./icons";
import { maskAddress } from "../utils/format";

function AddressLink({ address, placeholder = "n/a" }) {
  if (!address) {
    return (
      <span className="stat-tile-value stat-tile-value-sm muted-text">{placeholder}</span>
    );
  }

  return (
    <a
      href={`${EXPLORER_URL}/address/${address}`}
      target="_blank"
      rel="noreferrer"
      className="explorer-link stat-tile-value stat-tile-value-sm"
      title={address}
    >
      <span className="explorer-link-text">{maskAddress(address)}</span>
      <IconExternalLink className="explorer-link-icon" size={12} />
    </a>
  );
}

export default function ContractOverview({ expanded = false }) {
  const tokenAddress = CONTRACTS.token;

  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "name",
    query: { enabled: tokenAddress !== "0x0000000000000000000000000000000000000000" },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "symbol",
    query: { enabled: tokenAddress !== "0x0000000000000000000000000000000000000000" },
  });

  const { data: transferGated } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "transferGated",
    query: { enabled: tokenAddress !== "0x0000000000000000000000000000000000000000" },
  });

  const { data: checker } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "permissionChecker",
    query: { enabled: tokenAddress !== "0x0000000000000000000000000000000000000000" },
  });

  const hasDeploy = tokenAddress !== "0x0000000000000000000000000000000000000000";

  return (
    <section>
      <p className="widget-app-name">Sybil-Proof ERC-20</p>
      <p className="overview-lead">
        KYC-gated token on Redbelly Testnet. Minting always requires{" "}
        <code>hasChainPermission</code>; transfers follow the on-chain gate toggle.
      </p>

      <div className="stat-grid stat-grid-overview">
        <div className="stat-tile">
          <span className="stat-tile-label">Token</span>
          <span className="stat-tile-value stat-tile-value-sm">
            {hasDeploy ? `${name || "…"} (${symbol || "…"})` : "Not configured"}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Transfer gate</span>
          <span
            className={`stat-tile-value stat-tile-value-sm ${
              transferGated === undefined
                ? "muted-text"
                : transferGated
                  ? "text-warn"
                  : "text-ok"
            }`}
          >
            {transferGated === undefined
              ? "n/a"
              : transferGated
                ? "Gated (KYC)"
                : "Ungated"}
          </span>
        </div>
        {expanded && (
          <>
            <div className="stat-tile">
              <span className="stat-tile-label">SybilProofToken</span>
              <AddressLink
                address={hasDeploy ? tokenAddress : null}
                placeholder="Set VITE_TOKEN_ADDRESS"
              />
            </div>
            <div className="stat-tile">
              <span className="stat-tile-label">Permission checker</span>
              <AddressLink address={checker} />
            </div>
          </>
        )}
      </div>

      {hasDeploy && !expanded && (
        <div className="tx-links">
          <a
            className="explorer-link"
            href={`${EXPLORER_URL}/address/${tokenAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="explorer-link-text">View token on explorer</span>
            <IconExplorer className="explorer-link-icon" size={14} />
          </a>
        </div>
      )}

      <div className="info-block info-block-compact">
        <div className="info-block-title">Anti-bot guarantees</div>
        <p className="info-block-text">
          <strong>Mint</strong> · always gated; owner cannot mint to unverified wallets.
          <br />
          <strong>Transfer</strong> · owner toggles <code>setTransferGated</code> between KYC-gated
          and open transfer modes.
        </p>
      </div>
    </section>
  );
}
