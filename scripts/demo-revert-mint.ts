import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Demo: unverified wallet calls mint(uint256) → KycVerificationRequiredForMint.
 * Uses eth_call on testnet (Redbelly restricts writes from unauthorised senders).
 * Reviewers can reproduce the same path from the live UI with their wallet.
 */
async function main() {
  const deployment = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "deployments", "redbellyTestnet.json"),
      "utf8"
    )
  );
  const tokenAddress = deployment.contracts.sybilProofToken;
  const token = await ethers.getContractAt("SybilProofToken", tokenAddress);

  const unverified = "0x1111111111111111111111111111111111111111";
  const amount = ethers.parseEther("1");
  const data = token.interface.encodeFunctionData("mint", [amount]);

  try {
    await ethers.provider.call({ to: tokenAddress, from: unverified, data });
    console.error("Expected revert but eth_call succeeded");
    process.exit(1);
  } catch (err: unknown) {
    const error = err as { data?: string; error?: { data?: string } };
    const revertData = error.data ?? error.error?.data;
    if (!revertData) throw err;

    const parsed = token.interface.parseError(revertData);
    if (parsed?.name !== "KycVerificationRequiredForMint") {
      throw new Error(`Expected KycVerificationRequiredForMint, got ${parsed?.name ?? revertData}`);
    }
    if (parsed.args[0]?.toLowerCase() !== unverified.toLowerCase()) {
      throw new Error(`Expected recipient ${unverified}, got ${parsed.args[0]}`);
    }

    console.log("eth_call OK: unverified caller", unverified);
    console.log("Revert:", parsed.name, "→", parsed.args[0]);
    console.log("");
    console.log("Live self-test (reviewer, no deployer key):");
    console.log("  https://redbelly-dao-task1.vercel.app/");
    console.log("  Connect wallet → Mint to my wallet before KYC → same revert on-chain");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
