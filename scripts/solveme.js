const { ethers } = require('hardhat');

async function main() {
  const [/*deployer, */attackerAcc] = await ethers.getSigners();
  const SolveMe = await ethers.getContractFactory("SolveMe", deployer);
  console.log("Deploying SolveMe...");
  const solveMe = await SolveMe.deploy();
  await solveMe.deployed();
  console.log("solveMe deployed to:", solveMe.address);
  // const solveMe = await ethers.getContractAt("SolveMe", "0x6E4198C61C75D1B4D1cbcd00707aAC7d76867cF8");

  const Attacker = await ethers.getContractFactory("SolveMeAttacker", attackerAcc);
  console.log("Deploying Attacker...");
  const attacker = await Attacker.deploy(solveMe.address);
  await attacker.deployed();
  console.log("Attacker deployed to:", attacker.address);
  await attacker.connect(attackerAcc).exploit();
  
  console.log(await solveMe.isSolved());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
