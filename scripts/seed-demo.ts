import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const DEPLOYMENT_FILE = path.join(
  __dirname,
  "..",
  "deployments",
  "redbellyTestnet.json"
);

async function main() {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    throw new Error(`Missing ${DEPLOYMENT_FILE}. Run npm run deploy:testnet first.`);
  }

  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
  const tokenAddress = deployment.contracts.sybilProofToken;
  const checkerAddress = deployment.contracts.permissionChecker;

  const [deployer] = await ethers.getSigners();
  const token = await ethers.getContractAt("SybilProofToken", tokenAddress);
  const checker = await ethers.getContractAt(
    "RedbellyPermissionChecker",
    checkerAddress
  );

  const allowed = await checker.hasChainPermission(deployer.address);
  console.log("Deployer KYC status:", allowed);

  if (!allowed) {
    console.log(
      "Deployer lacks testnet Permission. Complete KYC + testnet unlock via:",
      "https://vine.redbelly.network/identity/user-access/"
    );
    return;
  }

  const amount = ethers.parseEther("1000");
  const tx = await token.mint(amount);
  await tx.wait();
  console.log("Minted", ethers.formatEther(amount), "SYBL to", deployer.address);
  console.log("Tx:", tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
