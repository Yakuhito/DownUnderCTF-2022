// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import 'hardhat/console.sol';

/*
for finding 'thingy' first part: repeating pattern, see code returned by extcode, BBBB like in exploit
bf code:
import sha3

i = 0x12345678
limit = 256 * 256 * 256 * 256

def check(i):
        b = bytes.fromhex(hex(i)[2:].rjust(8, "0"))
        print(b)
        k = sha3.keccak_256()
        k.update(b)
        if (int(k.hexdigest(), 16) & 0xFF) == 0x77:
                return True
        return False


while i < limit:
        if check(i):
                print("FOUND ID")
                print(hex(i))
                break
        elif i % 0xfffff == 0:
                print(hex(i))
        i += 1
*/

// second one: lots of tries :)

/*
bf codehash:

import sha3
from web3 import Web3
import solcx

i = 0xffffff1234576c00000000000000000000000000000000000000000000000000
replaceMe = "0xffffff1234576c00000000000000000000000000000000000000000000000000"

solcx.install_solc(version='0.8.9')
solcx.set_solc_version('0.8.9')

def check(i):
	compiled_sol = solcx.compile_source("""
pragma solidity ^0.8.0;

contract Constructoor {
    address private vault;

    constructor(address _vault) {
        vault = _vault;
    }

    fallback() external payable {
        //                       |      | for bytecode loaded == 0x77               salt for code (manually bf)
        uint256 thingy = 0xffffff1234576c00000000000000000000000000000000000000000000000000; // dice roll
        uint256 a = 0x4343434331333337000000000000000000000000000000000000000000000000;
        address _vault = vault;
        assembly {
            sstore(0xabcdef, thingy)
            mstore(0x7, a)
            a := call(
                10000000000,
                _vault,
                0,
                0x7,
                8,
                0x13,
                0
            )
        }
    }
}
	""".replace(replaceMe, hex(i)))
	contract_id, contract_interface = compiled_sol.popitem()
	bytecode = contract_interface['bin']
	actualBytecode = bytecode[556:556 + 410]
	b = bytes.fromhex(actualBytecode)
	k = sha3.keccak_256()
	k.update(b)
	if (int(k.hexdigest(), 16) & 0xFF000000) >> 0x18 == 205:
		print(int(k.hexdigest(), 16))
		print(bytecode)
		return True
	return False


while True:
	if check(i):
		print("FOUND ID")
		print(hex(i))
		break
	elif i % 0xfffff == 0:
		print(hex(i))
	i += 1

 */

contract Constructoor {
    address private vault;

    constructor(address _vault) {
        vault = _vault;
    }

    fallback() external payable {
        //                       |      | for bytecode loaded == 0x77               salt for code (manually bf)
        uint256 thingy = 0xffffff1234576c00000000000000000000000000000000000000000000000054; // dice roll
        uint256 a = 0x4343434331333337000000000000000000000000000000000000000000000000;
        address _vault = vault;
        assembly {
            mstore(0x7, a)
            a := call(
                10000000000,
                _vault,
                0,
                0x7,
                8,
                0x13,
                0
            )
        }
    }
}

interface IConstructoor {
    function yak() external payable;
}

contract EVMVaultUnlocker {
    address private immutable vault;
    uint256 public step2salt;
    address public step2DeployedAtAddress;

    constructor(address _vault) {
        vault = _vault;
    }

/*
ARG1 - POP(@0x174)
0x346D81803D471 == ((POP(@0x174) + 0x69B135A06C3) * 0x80) ^ 0xB3ABDCEF1F1
0x346D81803D471 ^ 0xB3ABDCEF1F1 == ((ARG1 + 0x69B135A06C3) * 0x80)
0x34de2a5cd2580 // 0x80 == ARG1 + 0x69B135A06C3
0x69bc54b9a4b == ARG1 + 0x69B135A06C3
ARG1 = 0xb1f19388
*/
    function step1() external {
        // uint256 a;

        // assembly {
        //     a := 0x41414141b1f19388000000000000000000000000000000000000000000000000
        //     a := shr(0xe0, a)
        // }
        // console.log("a: %s", a);

        uint32 selector = 0x41414141;
        uint32 magicVal = 0xb1f19388;
        (bool success, /*bytes memory data*/) = vault.call(abi.encodePacked(selector, magicVal));
        // console.log("returned data length: %s; success: %s", data.length, success);
        require(success, ":(");
    }

    function findStep2Salt(bytes memory creationCode) external {
        uint256 salt = 1;

        while(true) {
            bytes memory contractBytecode = abi.encodePacked(
                creationCode,
                abi.encode(address(address(vault)))
            );
            // contractBytecode[317] = 0x96;
            bytes32 codeHash = keccak256(
                abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(contractBytecode))
            );
            if(abi.encodePacked(codeHash)[31] == 0x77) {
                // console.logBytes(contractBytecode);
                step2salt = salt;
                return;
            }
                
            salt += 1;
        }
        step2salt = 0;
    }

    function step2(bytes memory creationCode, uint256 salt) external payable {
        // console.logBytes(creationCode);
        bytes memory contractBytecode = abi.encodePacked(
            creationCode,
            abi.encode(address(vault))
        );
        bytes32 codeHash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(contractBytecode))
        );
        address expectedAddress = address(uint160(uint(codeHash)));
        address addr;
        assembly {
            addr := create2(
                0, // value
                // Actual code starts after skipping the first 32 bytes
                add(contractBytecode, 0x20),
                mload(contractBytecode), // Load the size of code contained in the first 32 bytes
                salt // Salt from function arguments
            )

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        step2DeployedAtAddress = addr;

        // console.log("--");
        // console.log("Deployed at address: %s", addr);
        // console.logBytes(contractBytecode);
        // console.logBytes(address(addr).code);
        IConstructoor(address(expectedAddress)).yak{value: 1.337 ether}();
    }

/*
ARG1 - ABCD (each 1 BYTE)

0x0 == POP(@0xD5) ^ POP(@0xCA) + POP(@0xE5)
@0xE5 - BLOCKHASH(NUMBER() - 0x3 + (0x2 * (POP(@0x174) & 0xFF) & 0xFF))
D - 87
if the number is in the future (e.g., number + 14 - 3 = number + 11), blockchash will return 0

@0xD5 - 0x101 * (SHR(0x18, POP(@0x174)) & 0xFF) - A * 0x101
@0xCA - 0x2 * (SHL(0x7, POP(@0xC0)) + 0xD) - 2 * (SHL(0x7, BC)+ 0xD)
@0xC0 - SHR(0x8, POP(@0x174) & 0xFFFF00) - BC

BLOCKHASH(NUMBER() - 0x3 + (0x2 * (POP(@0x174) & 0xFF) & 0xFF))

A * 0x101 == 2 * (SHL(0x7, BC)+ 0xD)
for i in range(0xffff):
 if 2 * ((i << 7) + 0xD) % 0x101 == 0:
  a = 2 * ((i << 7) + 0xD) / 0x101
  if a > 0 and a < 0x100:
   print(i,a) # 26 26.0

-> ABCD = 0x1a001a87
*/
    function step3() external {
        uint32 selector = 0x44444444;
        uint32 magicVal = 0x1a001a87;
        
        // uint256 ok1;
        // assembly {
        //     ok1 := blockhash(
        //         add(
        //             sub(number(), 0x3),
        //             and(mul(0x2, and(magicVal, 0xFF)), 0xFF)
        //         )
        //     )
        // }
        // console.log("ok1: %s", ok1);

        (bool success,) = vault.call(abi.encodePacked(selector, magicVal));
        require(success, ":(");
    }

    function step4() external {
        uint32 selector = 0x45454545;
        uint32 magicVal = 0xf97ff;
        
        (bool success,) = vault.call(abi.encodePacked(selector, magicVal));
        require(success, ":(");
    }

    function solve() external {
        uint32 selector = 0x76726679;
        uint32 magicVal = 0x31333337;
        
        (bool success,) = vault.call(abi.encodePacked(selector, magicVal));
        require(success, ":(");
    }

    fallback() external {
        // console.log('fallback!');
        // 1st thing
        // uint256 a;
        // uint256 b;
        // assembly {
        //     a := shr(0xE0, calldataload(0x0))
        //     a := eq(a, 0x41414141)
        //     b := shr(0xE0, calldataload(0x4))
        //     b := add(b, 0x69B135A06C3)
        //     b := mul(b, 0x80)
        //     b := xor(b, 0xB3ABDCEF1F1)
        //     b := eq(b, 0x346D81803D471)
        // }
        // console.log("a: %s, b: %s", a, b);

        // 2nd thing
        address c = msg.sender;
        uint256 codeSize;
        uint256 codeHash;
        uint256 a;
        uint256 b;
        uint256 theHash;
        uint256 ok1;
        uint256 ok2;
        uint256 ok0;
        assembly {
            ok0 := shr(0xE0, calldataload(0x0))
            ok0 := eq(ok0, 0x43434343)
            codeSize := extcodesize(c)
            codeHash := extcodehash(c)
            a := shr(0x18, and(codeHash, 0xFF000000))
            extcodecopy(c, 0x7, 0xb, 0x4)
            b := mload(0x7)
            theHash := keccak256(0x7, 0x4)
            ok1 := eq(codeSize, a)
            ok2 := eq(and(theHash, 0xFF), 0x77)
        }

        console.log("a: %s", a);
        console.log("b: %s", b);
        console.log("loaded from contract: %s", b);
        console.log("ok0: %s", ok0);
        console.log("ok1: %s", ok1);
        console.log("ok2: %s", ok2);
        console.log("codesize: %s", codeSize);
        console.log("codehash1: %s", codeHash);
        console.log("deployed bytecode:");
        console.logBytes(address(c).code);

        // 4th thing
        // uint256 functionSelector;
        // uint256 magicVal;
        // uint256 ok0;
        // assembly {
        //     functionSelector := shr(0xE0, calldataload(0x0))
        //     magicVal := shr(0xE0, calldataload(0x4))
        //     ok0 := eq(functionSelector, 0x45454545)
        // }
        // console.log("ok0: %s", ok0);
    }
}