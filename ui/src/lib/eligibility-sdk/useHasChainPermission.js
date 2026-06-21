import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import {
  BOOTSTRAP_ABI,
  BOOTSTRAP_ADDRESS,
  PERMISSION_ABI,
} from "../../config/wagmi";

/**
 * Compatible with @redbellynetwork/eligibility-sdk useHasChainPermission.
 * Reads Permission.isAllowed via Bootstrap on Redbelly testnet.
 * @see https://docs.redbelly.network/pages/eligibility-sdk/client/hooks/useHasChainPermission/
 */
export function useHasChainPermission(address) {
  const [permissionAddr, setPermissionAddr] = useState(null);

  const { data: permAddr, error: bootstrapError } = useReadContract({
    address: BOOTSTRAP_ADDRESS,
    abi: BOOTSTRAP_ABI,
    functionName: "getContractAddress",
    args: ["permission"],
  });

  useEffect(() => {
    if (permAddr && permAddr !== "0x0000000000000000000000000000000000000000") {
      setPermissionAddr(permAddr);
    }
  }, [permAddr]);

  const {
    data,
    error: permissionError,
    isLoading,
    refetch,
  } = useReadContract({
    address: permissionAddr,
    abi: PERMISSION_ABI,
    functionName: "isAllowed",
    args: [address],
    query: { enabled: !!permissionAddr && !!address },
  });

  return {
    data: data ?? false,
    error: bootstrapError || permissionError,
    isLoading: isLoading || (!!address && !permissionAddr),
    refetch,
  };
}
