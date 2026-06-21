import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  MockPermissionChecker,
  SybilProofToken,
} from "../../typechain-types";

export interface TokenFixture {
  owner: HardhatEthersSigner;
  verified: HardhatEthersSigner;
  unverified: HardhatEthersSigner;
  permission: MockPermissionChecker;
  token: SybilProofToken;
}

export async function deployTokenFixture(
  transferGated = true
): Promise<TokenFixture> {
  const [owner, verified, unverified] = await ethers.getSigners();

  const Perm = await ethers.getContractFactory("MockPermissionChecker");
  const permission = await Perm.deploy();

  const Token = await ethers.getContractFactory("SybilProofToken");
  const token = await Token.deploy(
    "Sybil Proof Token",
    "SYBL",
    await permission.getAddress(),
    transferGated
  );

  await permission.setPermission(verified.address, true);

  return { owner, verified, unverified, permission, token };
}
