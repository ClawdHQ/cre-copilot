// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract WorkflowLog is Ownable {
    struct GenerationRecord {
        bytes32 contentHash;
        address generator;
        string description;
        uint256 timestamp;
        uint8 validationScore;
    }

    GenerationRecord[] public records;
    mapping(address => uint256[]) public recordsByGenerator;
    address public authorizedLogger;

    event WorkflowGenerated(
        bytes32 indexed contentHash,
        address indexed generator,
        uint256 indexed recordIndex
    );

    constructor() Ownable(msg.sender) {}

    function setAuthorizedLogger(address _logger) external onlyOwner {
        authorizedLogger = _logger;
    }

    function logGeneration(
        bytes32 contentHash,
        address generator,
        string calldata description,
        uint8 validationScore
    ) external {
        require(msg.sender == authorizedLogger, "Not authorized");
        uint256 index = records.length;
        records.push(GenerationRecord({
            contentHash: contentHash,
            generator: generator,
            description: description,
            timestamp: block.timestamp,
            validationScore: validationScore
        }));
        recordsByGenerator[generator].push(index);
        emit WorkflowGenerated(contentHash, generator, index);
    }

    function getRecord(uint256 index) external view returns (GenerationRecord memory) {
        return records[index];
    }

    function getRecordsByGenerator(address generator) external view returns (uint256[] memory) {
        return recordsByGenerator[generator];
    }

    function totalRecords() external view returns (uint256) {
        return records.length;
    }
}
