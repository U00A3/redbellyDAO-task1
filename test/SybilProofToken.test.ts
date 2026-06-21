import { expect } from "chai";
import { ethers } from "hardhat";
import { deployTokenFixture } from "./helpers/fixture";
describe("SybilProofToken", () => {
  it("mints to KYC-verified addresses", async () => {
    const fx = await deployTokenFixture();
    const amount = ethers.parseEther("100");

    await expect(fx.token.connect(fx.owner).mint(fx.verified.address, amount))
      .to.emit(fx.token, "Transfer")
      .withArgs(ethers.ZeroAddress, fx.verified.address, amount);

    expect(await fx.token.balanceOf(fx.verified.address)).to.equal(amount);
  });

  it("reverts mint for unverified wallet with KYC-specific error", async () => {
    const fx = await deployTokenFixture();
    const amount = ethers.parseEther("50");

    await expect(
      fx.token.connect(fx.owner).mint(fx.unverified.address, amount)
    )
      .to.be.revertedWithCustomError(fx.token, "KycVerificationRequiredForMint")
      .withArgs(fx.unverified.address);
  });

  it("does not allow owner to bypass mint KYC gate", async () => {
    const fx = await deployTokenFixture();
    await expect(
      fx.token.connect(fx.owner).mint(fx.unverified.address, 1n)
    ).to.be.revertedWithCustomError(fx.token, "KycVerificationRequiredForMint");
  });

  it("blocks transfers when gated and sender lacks KYC", async () => {
    const fx = await deployTokenFixture(true);
    const amount = ethers.parseEther("10");

    await fx.token.connect(fx.owner).mint(fx.verified.address, amount);
    await fx.permission.setPermission(fx.verified.address, false);

    await expect(
      fx.token.connect(fx.verified).transfer(fx.unverified.address, amount)
    )
      .to.be.revertedWithCustomError(fx.token, "KycVerificationRequiredForTransfer")
      .withArgs(fx.verified.address, fx.unverified.address);
  });

  it("blocks transfers when gated and recipient lacks KYC", async () => {
    const fx = await deployTokenFixture(true);
    const amount = ethers.parseEther("10");

    await fx.token.connect(fx.owner).mint(fx.verified.address, amount);

    await expect(
      fx.token.connect(fx.verified).transfer(fx.unverified.address, amount)
    )
      .to.be.revertedWithCustomError(fx.token, "KycVerificationRequiredForTransfer")
      .withArgs(fx.verified.address, fx.unverified.address);
  });

  it("allows transfers when gate is disabled (ungated)", async () => {
    const fx = await deployTokenFixture(false);
    const amount = ethers.parseEther("25");

    await fx.token.connect(fx.owner).mint(fx.verified.address, amount);

    await expect(
      fx.token.connect(fx.verified).transfer(fx.unverified.address, amount)
    )
      .to.emit(fx.token, "Transfer")
      .withArgs(fx.verified.address, fx.unverified.address, amount);

    expect(await fx.token.balanceOf(fx.unverified.address)).to.equal(amount);
  });

  it("toggles transfer gate between gated and ungated", async () => {
    const fx = await deployTokenFixture(true);
    const amount = ethers.parseEther("5");

    await fx.token.connect(fx.owner).mint(fx.verified.address, amount);

    await expect(
      fx.token.connect(fx.verified).transfer(fx.unverified.address, amount)
    ).to.be.revertedWithCustomError(fx.token, "KycVerificationRequiredForTransfer");

    await expect(fx.token.connect(fx.owner).setTransferGated(false))
      .to.emit(fx.token, "TransferGateUpdated")
      .withArgs(false);

    expect(await fx.token.transferGated()).to.equal(false);

    await fx.token.connect(fx.verified).transfer(fx.unverified.address, amount);
    expect(await fx.token.balanceOf(fx.unverified.address)).to.equal(amount);

    await fx.token.connect(fx.owner).setTransferGated(true);
    expect(await fx.token.transferGated()).to.equal(true);

    await fx.permission.setPermission(fx.verified.address, true);
    await fx.token.connect(fx.owner).mint(fx.verified.address, amount);
    await expect(
      fx.token.connect(fx.verified).transfer(fx.unverified.address, amount)
    ).to.be.revertedWithCustomError(fx.token, "KycVerificationRequiredForTransfer");
  });

  it("allows owner to update eligibility checker", async () => {
    const fx = await deployTokenFixture();
    const Perm = await ethers.getContractFactory("MockPermissionChecker");
    const nextChecker = await Perm.deploy();
    await nextChecker.setPermission(fx.unverified.address, true);

    const previous = await fx.token.permissionChecker();

    await expect(fx.token.connect(fx.owner).setPermissionChecker(await nextChecker.getAddress()))
      .to.emit(fx.token, "EligibilityCheckerUpdated")
      .withArgs(previous, await nextChecker.getAddress());

    await fx.token.connect(fx.owner).mint(fx.unverified.address, 100n);
    expect(await fx.token.balanceOf(fx.unverified.address)).to.equal(100n);
  });

  it("reverts zero-address eligibility checker update", async () => {
    const fx = await deployTokenFixture();
    await expect(
      fx.token.connect(fx.owner).setPermissionChecker(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(fx.token, "InvalidEligibilityCheckerAddress");
  });

  it("restricts admin functions to owner", async () => {
    const fx = await deployTokenFixture();
    const Perm = await ethers.getContractFactory("MockPermissionChecker");
    const nextChecker = await Perm.deploy();

    await expect(
      fx.token.connect(fx.verified).setTransferGated(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      fx.token.connect(fx.verified).setPermissionChecker(await nextChecker.getAddress())
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("KYC verification check uses less than 50k gas", async () => {
    const fx = await deployTokenFixture();
    const gas = await fx.permission.hasChainPermission.estimateGas(
      fx.verified.address
    );
    expect(gas).to.be.lte(50_000n);
  });
});

describe("RedbellyPermissionChecker", () => {
  it("resolves Permission via Bootstrap mock", async () => {
    const Perm = await ethers.getContractFactory("MockPermissionChecker");
    const permission = await Perm.deploy();

    const Bootstrap = await ethers.getContractFactory("MockBootstrap");
    const bootstrap = await Bootstrap.deploy();
    await bootstrap.setContractAddress("permission", await permission.getAddress());

    const Checker = await ethers.getContractFactory("RedbellyPermissionChecker");
    const checker = await Checker.deploy(await bootstrap.getAddress());

    const [, user] = await ethers.getSigners();
    expect(await checker.hasChainPermission(user.address)).to.equal(false);

    await permission.setPermission(user.address, true);
    expect(await checker.hasChainPermission(user.address)).to.equal(true);
  });

  it("reverts when Bootstrap has no permission contract", async () => {
    const Bootstrap = await ethers.getContractFactory("MockBootstrap");
    const bootstrap = await Bootstrap.deploy();

    const Checker = await ethers.getContractFactory("RedbellyPermissionChecker");
    await expect(Checker.deploy(await bootstrap.getAddress())).to.be.revertedWith(
      "Permission not configured"
    );
  });
});

describe("MockPermissionChecker", () => {
  it("supports batch permission updates", async () => {
    const Perm = await ethers.getContractFactory("MockPermissionChecker");
    const permission = await Perm.deploy();
    const signers = await ethers.getSigners();
    const accounts = signers.slice(1, 4).map((s) => s.address);

    await permission.setPermissions(accounts, true);
    for (const account of accounts) {
      expect(await permission.hasChainPermission(account)).to.equal(true);
    }
  });
});
