import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IndividualOnboarding } from "@redbellynetwork/eligibility-sdk";
import ContractOverview from "./components/ContractOverview";
import TokenPanel from "./components/TokenPanel";
import { EXPLORER_URL } from "./config/wagmi";

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#FA423C" fillOpacity="0.15" />
      <path
        d="M16 8l8 4v8l-8 4-8-4v-8l8-4z"
        stroke="#FA423C"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="16" cy="16" r="3" fill="#FA423C" />
    </svg>
  );
}

export default function App() {
  const { isConnected, address } = useAccount();
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className={`app-wrapper ${isConnected ? "app-expanded" : "app-collapsed"}`}>
      <header className="page-header">
        <h1 className="page-title">Sybil-Proof Token</h1>
        <p className="page-subtitle">Task 1 · Anti-Bot ERC-20 · Redbelly Testnet</p>
      </header>

      <div className={`widget-container ${isConnected ? "" : "widget-collapsed"}`}>
        <div className="widget-header">
          <div className="widget-logo">
            <Logo />
            Sybil-Proof Task 1
          </div>
          {isConnected && (
            <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
          )}
        </div>

        <div className="widget-content fade-in">
          {!isConnected ? (
            <div className="dashboard-collapsed">
              <ContractOverview expanded={false} />

              <div className="connect-gate">
                <div className="info-block info-block-compact">
                  <div className="info-block-title">Connect to explore</div>
                  <p className="info-block-text">
                    View token status, complete KYC onboarding, and interact with the Sybil-Proof
                    ERC-20 after connecting a wallet on Redbelly Testnet (chain 153).
                  </p>
                </div>

                <div className="connect-btn-wrapper">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button type="button" className="btn-connect" onClick={openConnectModal}>
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>

                <button
                  type="button"
                  className="btn-secondary btn-full"
                  onClick={() => setShowOnboarding(true)}
                >
                  Open KYC onboarding
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="dashboard-grid">
                <section className="dashboard-panel dashboard-panel-overview">
                  <ContractOverview expanded />
                </section>

                <section className="dashboard-panel dashboard-panel-holder">
                  <p className="widget-app-name">Token actions</p>

                  <div className="info-block info-block-compact">
                    <div className="info-block-title">Before you mint or transfer</div>
                    <p className="info-block-text">
                      Complete individual KYC and unlock testnet access via{" "}
                      <code>hasChainPermission</code>. Use the onboarding widget if your wallet is
                      not yet verified.
                    </p>
                    <button
                      type="button"
                      className="btn-connect btn-sm"
                      onClick={() => setShowOnboarding(true)}
                    >
                      Individual onboarding SDK
                    </button>
                  </div>

                  <TokenPanel />
                </section>
              </div>

              <div className="dashboard-footer">
                <div className="info-block info-block-inline">
                  <div className="info-block-title">On-chain errors (KYC-specific)</div>
                  <p className="info-block-text">
                    <code>KycVerificationRequiredForMint</code>,{" "}
                    <code>KycVerificationRequiredForTransfer</code> ·{" "}
                    <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
                      Routescan explorer
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showOnboarding && (
        <IndividualOnboarding onClose={() => setShowOnboarding(false)} />
      )}

      <p className="widget-info">
        Chain ID 153 · <code>hasChainPermission</code> via Redbelly Eligibility SDK
      </p>
    </div>
  );
}
