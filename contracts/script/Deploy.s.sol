// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        IdentityRegistry identity = new IdentityRegistry();
        ReputationRegistry reputation = new ReputationRegistry();
        reputation.initialize(address(identity));

        console.log("IDENTITY_REGISTRY_ADDRESS=%s", address(identity));
        console.log("REPUTATION_REGISTRY_ADDRESS=%s", address(reputation));

        vm.stopBroadcast();
    }
}
