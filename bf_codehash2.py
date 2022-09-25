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
	actualBytecode = bytecode[556:556 + 199 * 2]
	b = bytes.fromhex(actualBytecode)
	k = sha3.keccak_256()
	k.update(b)
	if (int(k.hexdigest(), 16) & 0xFF000000) >> 0x18 == 199:
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
