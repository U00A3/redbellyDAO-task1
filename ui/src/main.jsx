import React from "react";
import ReactDOM from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EligibilitySDKProvider } from "@redbellynetwork/eligibility-sdk";
import { config, CONTRACTS } from "./config/wagmi";
import App from "./App";
import "./App.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EligibilitySDKProvider
          config={{
            network: "testnet",
            apiKey: CONTRACTS.eligibilityApiKey,
          }}
        >
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </EligibilitySDKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
