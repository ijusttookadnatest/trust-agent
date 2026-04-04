// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract IdentityRegistry is ERC721URIStorage {
    uint256 private _nextId = 1;

    event Registered(uint256 indexed agentId, address indexed owner);

    constructor() ERC721("AgentIdentity", "AGID") {}

    function register() external returns (uint256 agentId) {
        agentId = _nextId++;
        _mint(msg.sender, agentId);
        emit Registered(agentId, msg.sender);
    }

    function setAgentURI(uint256 agentId, string calldata uri) external {
        require(_isAuthorized(ownerOf(agentId), msg.sender, agentId), "Not authorized");
        _setTokenURI(agentId, uri);
    }
}
