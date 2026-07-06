# Redbelly Testnet Deployment

**Network:** Redbelly Testnet (chain ID **153**)  
**Deployer:** `0xA2c6a3fC1E12dF79B9e3D099FaA2Ffe860450F76`  
**Deployed:** 2026-07-06 (v2 — public `mint(uint256)`)  
**Dashboard:** [redbelly-dao-task1.vercel.app](https://redbelly-dao-task1.vercel.app/)

## Active contracts

| Contract | Address |
|----------|---------|
| SybilProofToken (SYBL) | [`0x28b4841d24cEB8908aB042D14fdC47Ff4F41863d`](https://redbelly.testnet.routescan.io/address/0x28b4841d24cEB8908aB042D14fdC47Ff4F41863d) |
| RedbellyPermissionChecker | [`0xb8D9334984A070A8073a06EcB89fDe777eA6432C`](https://redbelly.testnet.routescan.io/address/0xb8D9334984A070A8073a06EcB89fDe777eA6432C) |

**On-chain Permission registry:** `0x519ba1b48D571FD92FAF6FE4D20fe74Ca435B690`  
**Bootstrap:** `0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5`  
**Transfer gate (initial):** `true`

## Demo transactions

| Step | Tx hash | Expected |
|------|---------|----------|
| KYC-verified deployer `mint(1000)` | [`0x54b1660…b1d87`](https://redbelly.testnet.routescan.io/tx/0x54b1660effff2f6c51b86f6b4c4f5403dfd5ab21d7e308d5b248f8c27e3b1d87) | Success |

**Reviewer self-test (no deployer key):** connect wallet on [live dashboard](https://redbelly-dao-task1.vercel.app/) → **Mint to my wallet** before KYC → on-chain revert `KycVerificationRequiredForMint`. After Access dApp unlock → mint succeeds.

Local/script check (eth_call, no gas):

```bash
npm run demo:revert-mint
```

## Verification

```bash
npx hardhat verify --network redbellyTestnet \
  0xb8D9334984A070A8073a06EcB89fDe777eA6432C \
  0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5

npx hardhat verify --network redbellyTestnet \
  0x28b4841d24cEB8908aB042D14fdC47Ff4F41863d \
  "Sybil Proof Token" "SYBL" \
  0xb8D9334984A070A8073a06EcB89fDe777eA6432C true
```

Explorer: https://redbelly.testnet.routescan.io

## Reproduce locally

```bash
npm run deploy:testnet
npm run seed:demo              # mint if deployer has testnet Permission
npm run demo:revert-mint       # eth_call revert demo
```

## Previous deployment (deprecated)

| Contract | Address |
|----------|---------|
| SybilProofToken v1 (`onlyOwner` mint) | `0x629681eAB098D1c5B793bc04e8E1DFB7Dc13806F` |

Superseded — reviewers could not self-test mint without deployer key.
