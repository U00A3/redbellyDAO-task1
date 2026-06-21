import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const BOOTSTRAP =
  process.env.BOOTSTRAP_ADDRESS ||
  "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5";
const TRANSFER_GATED = process.env.TRANSFER_GATED !== "false";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const useRedbellyChecker = network.chainId === 153n;

  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Transfer gated (initial):", TRANSFER_GATED);

  let permissionAddress: string;
  if (useRedbellyChecker) {
    const Checker = await ethers.getContractFactory("RedbellyPermissionChecker");
    const checker = await Checker.deploy(BOOTSTRAP);
    await checker.waitForDeployment();
    permissionAddress = await checker.getAddress();
    console.log("RedbellyPermissionChecker:", permissionAddress);
    console.log("Permission contract:", await checker.permission());
  } else {
    const Perm = await ethers.getContractFactory("MockPermissionChecker");
    const perm = await Perm.deploy();
    await perm.waitForDeployment();
    permissionAddress = await perm.getAddress();
  }

  const Token = await ethers.getContractFactory("SybilProofToken");
  const token = await Token.deploy(
    "Sybil Proof Token",
    "SYBL",
    permissionAddress,
    TRANSFER_GATED
  );
  await token.waitForDeployment();

  const out = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      sybilProofToken: await token.getAddress(),
      permissionChecker: permissionAddress,
    },
    bootstrap: BOOTSTRAP,
    transferGated: TRANSFER_GATED,
  };

  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(
    dir,
    network.chainId === 153n ? "redbellyTestnet.json" : "hardhat.json"
  );
  fs.writeFileSync(file, JSON.stringify(out, null, 2));

  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
