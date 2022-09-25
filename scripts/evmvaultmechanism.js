const { ethers } = require('hardhat');

async function main() {
  const [attackerAcc] = await ethers.getSigners();
  // console.log(await ethers.provider.getBlockWithTransactions(1)); // give ther to player
  // console.log(await ethers.provider.getBlockWithTransactions(2)); // bytecode
  // console.log(await ethers.provider.getBlockWithTransactions(3)); // null -> only 2 blocks
  // console.log((await ethers.provider.getBlockWithTransactions(2)).transactions[0]);
  // const data = "0x6102c56100106000396102c56000f3fe600836101561000e5760006000fd5b610168565b600065069b135a06c38201608081029050650b3abdcef1f18118905080660346d81803d47114159150505b919050565b600081600f526004600f2066fd28448c97d19c8160c81c14159150505b919050565b6000338031813b823f63ff000000811660181c6004600b6007873c600460072060ff811660778114838614670de0b6b3a76400008811607760ff8b1614020202159750505050505050505b919050565b600062ffff00821660081c600d8160071b0160020260ff8460181c166101010260ff60ff8616600202166003014303408083018218600014159450505050505b919050565b6000303f806007526000600060005b6020811015610142576001600187831c1614156101365760ff600751600883021c16830192506001820191505b5b600181019050610109565b50601181146105398306610309140293505050505b919050565b6000600090505b919050565b60003560e01c60043560e01c81637672667981146101cc57634141414181146101ea576342424242811461020e57634343434381146102325763444444448114610256576345454545811461027a57634646464681146102a05760006000fd6102c0565b6113375460ff8114156101e457600165736f6c766564555b506102c0565b6101f382610013565b8015156102085761133754604a811861133755505b506102c0565b61021782610043565b80151561022c576113375460d1811861133755505b506102c0565b61023b82610065565b80151561025057611337546064811861133755505b506102c0565b61025f826100b5565b801515610274576113375460b2811861133755505b506102c0565b610283826100fa565b600181141561029a57611337546063811861133755505b506102c0565b6102a98261015c565b8015156102be576113375460c4811861133755505b505b50005050";

  // go install github.com/Arachnid/evmdis/evmdis@latest
  // ~/go/bin/evmdis -ctor -bin < EVMVaultMechanism.sol.bin

  const VAULT = "0x6E4198C61C75D1B4D1cbcd00707aAC7d76867cF8";

  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));

  console.log("Deploying unlocker...");
  const Unlocker = await ethers.getContractFactory("EVMVaultUnlocker", attackerAcc);
  const unlocker = await Unlocker.deploy(VAULT);
  await unlocker.deployed();
  // const unlocker = await ethers.getContractAt("EVMVaultUnlocker", "0xffC07891E1247AAd34a907fc35AD7ea146BB767c");
  console.log("unlocker deployed at: " + unlocker.address);
  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));

  console.log("Executing step 1...")
  const step1Tx = await unlocker.connect(attackerAcc).step1();
  await step1Tx.wait();
  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));

  console.log("Executing step 2...");
  const creationCode = "0x608060405234801561001057600080fd5b506040516101dd3803806101dd833981810160405281019061003291906100db565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610108565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100a88261007d565b9050919050565b6100b88161009d565b81146100c357600080fd5b50565b6000815190506100d5816100af565b92915050565b6000602082840312156100f1576100f0610078565b5b60006100ff848285016100c6565b91505092915050565b60c7806101166000396000f3fe608060405260007fffffff1234576c000000000000000000000000000000000000000000000000a1905060007f4343434331333337000000000000000000000000000000000000000000000000905060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508160075260006013600860076000856402540be400f1915050505000fea2646970667358221220e2dd4c6f1cdb0aabddf0cff18b30b68ce188a63b5a303df0b552ccf9fcd6e3aa64736f6c63430008090033";
  const saltTx = await unlocker.connect(attackerAcc).findStep2Salt(creationCode);
  await saltTx.wait();
  const salt = await unlocker.step2salt();
  console.log({salt});
  const step2Tx = await unlocker.connect(attackerAcc).step2(creationCode, salt, {
    value: ethers.utils.parseEther("1.337"),
    gasLimit: 1000000
  });
  await step2Tx.wait();
  console.log(await unlocker.step2DeployedAtAddress()); // 0x2e33246b293Cc38F5d9113bed0D1A8D170539377
  // console.log(await ethers.provider.getCode("0x2e33246b293Cc38F5d9113bed0D1A8D170539377"));
  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));

  console.log("Executing step 3...");
  const step3Tx = await unlocker.connect(attackerAcc).step3();
  await step3Tx.wait();
  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));

  console.log("Executing step 4...");
  const step4Tx = await unlocker.connect(attackerAcc).step4();
  await step4Tx.wait();
  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));

  console.log("Unlocking vault...");
  const solveTx = await unlocker.connect(attackerAcc).solve();
  await solveTx.wait();
  console.log(await ethers.provider.getStorageAt(VAULT, 0x1337));
  console.log(await ethers.provider.getStorageAt(VAULT, 0x736f6c766564));
  console.log("done.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
