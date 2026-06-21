# Redbelly Testnet Deployment

**Network:** Redbelly Testnet (chain ID **153**)  
**Deployer:** `0xA2c6a3fC1E12dF79B9e3D099FaA2Ffe860450F76`  
**Deployed:** 2026-06-21  
**Dashboard:** connect Vercel to this repo (see [`docs/VERCEL.md`](VERCEL.md))

## Active contracts

| Contract | Address |
|----------|---------|
| SybilProofToken (SYBL) | [`0x629681eAB098D1c5B793bc04e8E1DFB7Dc13806F`](https://redbelly.testnet.routescan.io/address/0x629681eAB098D1c5B793bc04e8E1DFB7Dc13806F) |
| RedbellyPermissionChecker | [`0xf0da85AB0D065c46290501C3c138035fA8f9EE8F`](https://redbelly.testnet.routescan.io/address/0xf0da85AB0D065c46290501C3c138035fA8f9EE8F) |

**On-chain Permission registry:** `0x519ba1b48D571FD92FAF6FE4D20fe74Ca435B690`  
**Bootstrap:** `0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5`  
**Transfer gate (initial):** `true`

## Demo transactions

| Step | Tx hash | Expected |
|------|---------|----------|
| Mint to unverified wallet | [`0x165bf83…2b0c1`](https://redbelly.testnet.routescan.io/tx/0x165bf83af12bec27506fb30f2ee3c6e5a575e0dd91d7fde15483f41c51f2b0c1) | Revert `KycVerificationRequiredForMint` |
| Mint to KYC-verified deployer (1000 SYBL) | [`0x9c0ddef…75439`](https://redbelly.testnet.routescan.io/tx/0x9c0ddefec9cb7c9a983d6245458abb54d62c2e11da357eca0593cb8bb8075439) | Success |

Unverified recipient used for revert demo: `0x1111111111111111111111111111111111111111` (`hasChainPermission == false`).

## Verification

```bash
npx hardhat verify --network redbellyTestnet \
  0xf0da85AB0D065c46290501C3c138035fA8f9EE8F \
  0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5

npx hardhat verify --network redbellyTestnet \
  0x629681eAB098D1c5B793bc04e8E1DFB7Dc13806F \
  "Sybil Proof Token" "SYBL" \
  0xf0da85AB0D065c46290501C3c138035fA8f9EE8F true
```

Explorer: https://redbelly.testnet.routescan.io

## Reproduce locally

```bash
npm run deploy:testnet
npm run seed:demo              # mint if deployer has testnet Permission
npx hardhat run scripts/demo-revert-mint.ts --network redbellyTestnet
```
