// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlockBreaker {
    mapping(address => uint256) public scores;

    event BlockBroken(address indexed player, uint256 newScore);

    function breakBlock() public {
        scores[msg.sender] += 1;
        emit BlockBroken(msg.sender, scores[msg.sender]);
    }

    function getScore(address player) public view returns (uint256) {
        return scores[player];
    }
}
