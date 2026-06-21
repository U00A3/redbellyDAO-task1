import { createContext, useContext } from "react";

const EligibilityConfigContext = createContext({
  network: "testnet",
  apiKey: "",
});

export function EligibilitySDKProvider({ config, children }) {
  return (
    <EligibilityConfigContext.Provider value={config || {}}>
      {children}
    </EligibilityConfigContext.Provider>
  );
}

export function useEligibilityConfig() {
  return useContext(EligibilityConfigContext);
}
