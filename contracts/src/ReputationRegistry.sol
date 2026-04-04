// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.20;

contract ReputationRegistry {
    address public identityRegistry;

    struct Feedback {
        int128 value;
        uint8 valueDecimals;
        string tag1;
    }

    mapping(uint256 => mapping(address => Feedback[])) private _feedback;
    mapping(uint256 => address[]) private _clients;
    mapping(uint256 => mapping(address => bool)) private _isClient;

    event NewFeedback(uint256 indexed agentId, address indexed client, int128 value, uint8 valueDecimals, string tag1);

    function initialize(address identityRegistry_) external {
        require(identityRegistry == address(0), "Already initialized");
        identityRegistry = identityRegistry_;
    }

    function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string calldata tag1) external {
        require(valueDecimals <= 18, "valueDecimals > 18");

        if (!_isClient[agentId][msg.sender]) {
            _clients[agentId].push(msg.sender);
            _isClient[agentId][msg.sender] = true;
        }
        _feedback[agentId][msg.sender].push(Feedback(value, valueDecimals, tag1));

        emit NewFeedback(agentId, msg.sender, value, valueDecimals, tag1);
    }

    /// @notice Returns count + average value across provided clientAddresses (spec-compliant)
    function getSummary(uint256 agentId, address[] calldata clientAddresses)
        external
        view
        returns (uint64 count, int128 avgValue)
    {
        require(clientAddresses.length > 0, "clientAddresses must be non-empty");
        int256 total = 0;
        for (uint256 i = 0; i < clientAddresses.length; i++) {
            Feedback[] memory items = _feedback[agentId][clientAddresses[i]];
            for (uint256 j = 0; j < items.length; j++) {
                total += int256(items[j].value);
                count++;
            }
        }
        avgValue = count > 0 ? int128(total / int256(uint256(count))) : int128(0);
    }

    function getClients(uint256 agentId) external view returns (address[] memory) {
        return _clients[agentId];
    }
}
