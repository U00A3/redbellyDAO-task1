import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deployment = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "deployments", "redbellyTestnet.json"),
      "utf8"
    )
  );
  const token = await ethers.getContractAt(
    "SybilProofToken",
    deployment.contracts.sybilProofToken
  );
  const unverified = "0x1111111111111111111111111111111111111111";
  const tx = await token.mint(unverified, ethers.parseEther("1"), {
    gasLimit: 300_000n,
  });
  console.log("Submitted:", tx.hash);
  await tx.wait();
}

main().catch((err) => {
  const hash = err.receipt?.hash || err.transaction?.hash;
  if (hash) {
    console.log("Expected revert tx:", hash);
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
