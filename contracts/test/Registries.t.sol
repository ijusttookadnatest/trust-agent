// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";

contract RegistriesTest is Test {
    IdentityRegistry identity;
    ReputationRegistry reputation;

    address owner = address(0x1);
    address client = address(0x2);

    function setUp() public {
        identity = new IdentityRegistry();
        reputation = new ReputationRegistry();
        reputation.initialize(address(identity));
    }

    // --- IdentityRegistry ---

    function test_register_incrementsId() public {
        vm.prank(owner);
        uint256 id1 = identity.register();
        vm.prank(owner);
        uint256 id2 = identity.register();
        assertEq(id1, 1);
        assertEq(id2, 2);
    }

    function test_register_ownerIsCorrect() public {
        vm.prank(owner);
        uint256 agentId = identity.register();
        assertEq(identity.ownerOf(agentId), owner);
    }

    function test_setAgentURI_works() public {
        vm.prank(owner);
        uint256 agentId = identity.register();
        vm.prank(owner);
        identity.setAgentURI(agentId, "data:application/json;base64,abc");
        assertEq(identity.tokenURI(agentId), "data:application/json;base64,abc");
    }

    function test_setAgentURI_revertsIfNotOwner() public {
        vm.prank(owner);
        uint256 agentId = identity.register();
        vm.prank(client); // client tries to update URI
        vm.expectRevert("Not authorized");
        identity.setAgentURI(agentId, "malicious");
    }

    // --- ReputationRegistry ---

    function test_giveFeedback_storesCorrectly() public {
        vm.prank(owner);
        uint256 agentId = identity.register();

        vm.prank(client);
        reputation.giveFeedback(agentId, 80, 0, "successRate");

        address[] memory clients = reputation.getClients(agentId);
        assertEq(clients.length, 1);
        assertEq(clients[0], client);
    }

    function test_getSummary_averageIsCorrect() public {
        vm.prank(owner);
        uint256 agentId = identity.register();

        address client2 = address(0x3);

        vm.prank(client);
        reputation.giveFeedback(agentId, 60, 0, "successRate");
        vm.prank(client2);
        reputation.giveFeedback(agentId, 100, 0, "successRate");

        address[] memory clients = reputation.getClients(agentId);
        (uint64 count, int128 avg) = reputation.getSummary(agentId, clients);

        assertEq(count, 2);
        assertEq(avg, 80); // (60 + 100) / 2
    }

    function test_getSummary_revertsOnEmptyAddresses() public {
        vm.prank(owner);
        uint256 agentId = identity.register();
        address[] memory empty = new address[](0);
        vm.expectRevert("clientAddresses must be non-empty");
        reputation.getSummary(agentId, empty);
    }
}
