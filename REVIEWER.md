# Reviewer Guide - Task 1

## Task board alignment

| Task item | Submission evidence |
|-----------|---------------------|
| OpenZeppelin ERC-20 (no custom token impl) | `contracts/SybilProofToken.sol` extends `ERC20`, `Ownable` |
| `hasChainPermission` on gated actions | `RedbellyPermissionChecker.sol` → `Permission.isAllowed` |
| Mint gate non-bypassable for owner | `mint()` / `mintTo()` revert `KycVerificationRequiredForMint`; tests *does not allow owner to bypass* |
| Public mint for reviewers | `mint(uint256)` — any wallet; KYC gate on caller (see § Reviewer self-test mint) |
| Configurable transfer gate | `transferGated`, `setTransferGated`, toggle test |
| Admin update eligibility checker | `setPermissionChecker` + `EligibilityCheckerUpdated` event |
| KYC-specific error messages | custom errors (not generic `require` strings) |
| React + IndividualOnboardingSDK + `useHasChainPermission` | `ui/src/lib/eligibility-sdk/` (SDK-compatible; see § Eligibility SDK below) |
| Coverage ≥ 90% | `docs/coverage/coverage-final.json` (100% lines; regenerate: `npm run coverage`) |
| Deploy script chain 153 | `scripts/deploy.ts`, `hardhat.config.ts` |
| Gas check ≤ 50k | test *KYC verification check uses less than 50k gas* |

## Quick verification

```bash
npm install
npm test
npm run coverage
npm run ui:build
```

Expected: all tests pass (16), line coverage ≥ 90% (artifact: [`docs/coverage/coverage-final.json`](docs/coverage/coverage-final.json)), UI builds without errors.

## Reviewer self-test mint (live dashboard — no deployer key)

This is the quality-benchmark path: **unverified wallet reverts on mint, succeeds after KYC**.

1. Open [live dashboard](https://redbelly-dao-task1.vercel.app/) on Redbelly Testnet (chain 153).
2. Connect a wallet **without** testnet Permission (fresh wallet is fine).
3. In **Mint (KYC-gated)**, enter an amount and click **Mint to my wallet**.
4. Confirm the transaction **reverts** with `KycVerificationRequiredForMint(yourAddress)` on [Routescan](https://redbelly.testnet.routescan.io).
5. Open **Individual onboarding SDK** → complete KYC + testnet unlock via [Redbelly Access dApp](https://vine.redbelly.network/identity/user-access/).
6. Wait for **Chain permission (KYC)** badge → **Verified**, then **Mint to my wallet** again → success.

No deployer `PRIVATE_KEY` required — `mint(uint256)` is callable by any wallet; only `hasChainPermission(msg.sender)` gates it.

Optional scripted demo (deployer funds a random unverified wallet for gas):

```bash
npm run demo:revert-mint   # unverified caller → KycVerificationRequiredForMint
```

## Walkthrough options

### Option A — UI only (no deploy)

1. `cd ui && npm install && npm run dev`
2. Connect wallet on Redbelly Testnet (chain 153)
3. Try **Mint to my wallet** before KYC → `KycVerificationRequiredForMint`
4. Open **Individual onboarding SDK** — KYC flow entry point
5. After unlock, mint again and confirm success
6. Observe **Chain permission (KYC)** badge via `useHasChainPermission`

### Option B — Full testnet demo

1. Copy `.env.example` → `.env`, set `PRIVATE_KEY`
2. `npm run deploy:testnet`
3. Copy addresses to `ui/.env` (`VITE_TOKEN_ADDRESS`, `VITE_PERMISSION_CHECKER_ADDRESS`)
4. Complete KYC + testnet unlock: [Redbelly Access dApp](https://vine.redbelly.network/identity/user-access/)
5. `npm run seed:demo` or mint via UI
6. Verify unverified recipient mint reverts `KycVerificationRequiredForMint` on explorer

### Option C — Tests only

```bash
npm test
```

Key scenarios:

- Unverified `mint(uint256)` → `KycVerificationRequiredForMint`
- Verified `mint(uint256)` → success
- Owner `mintTo` unverified → `KycVerificationRequiredForMint`
- Transfer gated / ungated toggle
- `setPermissionChecker` admin path

## IndividualOnboardingSDK: why the UI does not embed the official widget

The task brief requires a React example with **IndividualOnboardingSDK** and **`useHasChainPermission`**. Per [Redbelly docs](https://docs.redbelly.network/pages/eligibility-sdk/onboarding/individual/overview/), the full onboarding widget requires:

1. **`@redbellynetwork/eligibility-sdk`** from GitHub Packages (GitHub PAT with `read:packages`)
2. An **Averer API key** — *contact Averer Customer Support* per [installation docs](https://docs.redbelly.network/pages/eligibility-sdk/installation/); this is a **developer integration key**, not an end-user credential

**This submitter has requested an API key from Averer Customer Support** (via Redbelly eligibility onboarding channels). The key was **not yet available at submission time**, so the dashboard does **not** embed the official `<IndividualOnboarding />` component from the private npm package.

### What this submission ships instead (same pattern as Task 3)

Task 3 was accepted with **on-chain `Permission.isAllowed`** checks in the UI (no Averer widget embed). Task 1 follows the same approach for individual KYC:

| Layer | Implementation |
|-------|----------------|
| **On-chain gate** | `RedbellyPermissionChecker.hasChainPermission` → `Permission.isAllowed` |
| **`useHasChainPermission`** | SDK-compatible shim — same API and same chain reads as [official hook docs](https://docs.redbelly.network/pages/eligibility-sdk/client/hooks/useHasChainPermission/) |
| **KYC entry point** | Styled **Individual onboarding** modal in `ui/` + link to [Redbelly Access dApp](https://vine.redbelly.network/identity/user-access/) for testnet unlock |

The shim lives at `ui/src/lib/eligibility-sdk/`, aliased as `@redbellynetwork/eligibility-sdk` in `ui/vite.config.js`:

| Export | Current behaviour |
|--------|-------------------|
| `useHasChainPermission(address)` | `Bootstrap` → `Permission.isAllowed(address)` via wagmi |
| `IndividualOnboarding` | Onboarding modal; redirects to Access dApp for KYC / testnet Permission |
| `EligibilitySDKProvider` | Config wrapper (`network`, `apiKey`) — ready for official SDK |

**Reviewers without an Averer API key** can still verify the full task via:

- `npm test` / `npm run coverage` (mint gate, transfer toggle, KYC errors, gas)
- UI: connect wallet → **Chain permission (KYC)** badge → onboarding modal → Access dApp
- Testnet: mint revert before Permission, success after unlock

On-chain gating uses the **same** `hasChainPermission` signal whether the UI uses the shim or the official widget.

### Planned upgrade when Averer API key is issued

When the developer API key arrives, the integration path is:

1. Add `.npmrc` per [installation docs](https://docs.redbelly.network/pages/eligibility-sdk/installation/)
2. `npm install @redbellynetwork/eligibility-sdk` in `ui/`
3. Remove the Vite alias in `ui/vite.config.js`
4. Set `VITE_ELIGIBILITY_SDK_API_KEY` in `ui/.env`
5. Replace shim imports with the official `IndividualOnboarding` widget inside `EligibilitySDKProvider`

No contract changes are required — only the frontend onboarding surface upgrades from shim modal to the official Averer-backed widget.

## On-chain errors (reviewer checklist)

| Error | When |
|-------|------|
| `KycVerificationRequiredForMint(recipient)` | Mint to address without chain permission |
| `KycVerificationRequiredForTransfer(from, to)` | Transfer while gate enabled and party lacks KYC |
| `InvalidEligibilityCheckerAddress()` | Admin sets zero checker |

## Gas benchmark

Test `KYC verification check uses less than 50k gas` asserts `MockPermissionChecker.hasChainPermission` estimate ≤ 50,000. Production `Permission.isAllowed` on testnet is the same call path via `RedbellyPermissionChecker`.

---

## Known limitations

- **No Averer API key yet:** official `IndividualOnboarding` widget from `@redbellynetwork/eligibility-sdk` is not embedded; shim + Access dApp substitutes for the KYC UX (same approach as accepted Task 3 for permission checks).
- **API key requested:** submitter contacted Averer Customer Support; official widget will be wired when the developer key is issued (see § Planned upgrade above).
- **Mainnet KYC ≠ testnet Permission:** users must unlock chain 153 separately via the Access dApp even after mainnet identity verification.

---

## Notes for Reviewer (copy-paste)

```
Repo: Task 1 — Sybil-Proof ERC-20 (Anti-Bot Standard)
Live: https://redbelly-dao-task1.vercel.app/
Walkthrough: REVIEWER.md | Guide: docs/guide.md

Quick verify:
  npm install && npm test && npm run ui:build
  Coverage artifact: docs/coverage/coverage-final.json (100% lines)

Reviewer self-test mint (no deployer key):
  1. Connect wallet without KYC on live dashboard
  2. Mint to my wallet → KycVerificationRequiredForMint
  3. Complete KYC via Access dApp → mint succeeds

IndividualOnboardingSDK / Averer:
  - Full widget requires Averer developer API key (per Redbelly Eligibility SDK docs).
  - Submitter requested key from Averer Customer Support; not received at submission time.
  - UI ships SDK-compatible useHasChainPermission + onboarding modal → Redbelly Access dApp.
  - Same on-chain signal as official SDK (Permission.isAllowed via Bootstrap).
  - Task 3 accepted with equivalent permission-check pattern (no Averer widget embed).
  - When API key arrives: install @redbellynetwork/eligibility-sdk, remove Vite alias, set VITE_ELIGIBILITY_SDK_API_KEY.

On-chain demo:
  - mint(uint256) callable by any wallet; gate on msg.sender
  - Owner mintTo still KYC-gated (cannot bypass)
  - setTransferGated toggles transfer KYC gate (covered in tests)
```
