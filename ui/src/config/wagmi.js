import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const redbellyTestnet = defineChain({
  id: 153,
  name: "Redbelly Network Testnet",
  nativeCurrency: { name: "RBNT", symbol: "RBNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://governors.testnet.redbelly.network"] },
  },
  blockExplorers: {
    default: {
      name: "Routescan",
      url: "https://redbelly.testnet.routescan.io",
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "Sybil-Proof Token Task 1",
  projectId: "b1e42d0cbe4a1c4890e948839b2e7e18",
  chains: [redbellyTestnet],
});

export const EXPLORER_URL = redbellyTestnet.blockExplorers.default.url;

export const REBELLY_ACCESS_URL =
  "https://vine.redbelly.network/identity/user-access/";

export const BOOTSTRAP_ADDRESS = "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5";

export const TESTNET_PERMISSION_ADDRESS =
  "0x519ba1b48D571FD92FAF6FE4D20fe74Ca435B690";

export const BOOTSTRAP_ABI = [
  {
    name: "getContractAddress",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "contractName", type: "string" }],
    outputs: [{ name: "", type: "address" }],
  },
];

export const PERMISSION_ABI = [
  {
    name: "isAllowed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_address", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
];

export const TOKEN_ABI = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transferGated",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "permissionChecker",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "mintTo",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "setTransferGated",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "gated", type: "bool" }],
    outputs: [],
  },
];

export const CONTRACTS = {
  token:
    import.meta.env.VITE_TOKEN_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  permissionChecker:
    import.meta.env.VITE_PERMISSION_CHECKER_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  eligibilityApiKey: import.meta.env.VITE_ELIGIBILITY_SDK_API_KEY || "",
};
