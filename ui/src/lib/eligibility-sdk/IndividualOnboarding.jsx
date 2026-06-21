import { useState } from "react";
import { REBELLY_ACCESS_URL } from "../../config/wagmi";
import { useEligibilityConfig } from "./EligibilitySDKProvider";

/**
 * Individual onboarding flow — mirrors IndividualOnboarding from Eligibility SDK.
 * When VITE_ELIGIBILITY_SDK_API_KEY is set, swap alias to the official package.
 * @see https://docs.redbelly.network/pages/eligibility-sdk/onboarding/individual/overview/
 */
export function IndividualOnboarding({ onClose }) {
  const { network } = useEligibilityConfig();
  const [step, setStep] = useState(1);

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-modal fade-in">
        <div className="onboarding-header">
          <h2 className="onboarding-title">Individual KYC onboarding</h2>
          <button type="button" className="onboarding-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="onboarding-lead">
          Complete identity verification and unlock Redbelly network access ({network}) to mint
          and transfer SYBL tokens.
        </p>

        <ol className="onboarding-steps">
          <li className={step >= 1 ? "onboarding-step active" : "onboarding-step"}>
            <span className="requirement-icon">1</span>
            <div>
              <div className="requirement-title">Connect wallet</div>
              <div className="requirement-desc">Use RainbowKit in the app header.</div>
            </div>
          </li>
          <li className={step >= 2 ? "onboarding-step active" : "onboarding-step"}>
            <span className="requirement-icon">2</span>
            <div>
              <div className="requirement-title">Complete KYC</div>
              <div className="requirement-desc">
                Verify identity via Redbelly Access (Privado ID / Averer credentials).
              </div>
            </div>
          </li>
          <li className={step >= 3 ? "onboarding-step active" : "onboarding-step"}>
            <span className="requirement-icon">3</span>
            <div>
              <div className="requirement-title">Unlock testnet</div>
              <div className="requirement-desc">
                Request chain permission on Redbelly Testnet (chain 153).
              </div>
            </div>
          </li>
        </ol>

        <div className="onboarding-actions">
          {step < 3 ? (
            <button type="button" className="btn-connect" onClick={() => setStep((s) => s + 1)}>
              Next step
            </button>
          ) : (
            <a
              href={REBELLY_ACCESS_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-connect onboarding-link-btn"
            >
              Open Redbelly Access dApp
            </a>
          )}
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="onboarding-footnote">
          Full Averer widget pending developer API key (requested from Averer Customer Support).
          Until issued, complete KYC via the Access dApp above. See <code>REVIEWER.md</code> and{" "}
          <code>docs/guide.md</code> §6.3.
        </p>
      </div>
    </div>
  );
}
