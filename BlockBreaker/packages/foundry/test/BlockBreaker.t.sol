// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/BlockBreaker.sol";

contract BlockBreakerTest is Test {
    BlockBreaker game;

    function setUp() public {
        game = new BlockBreaker();
    }

    function testBreakBlock() public {
        game.breakBlock();
        assertEq(game.getScore(address(this)), 1);
    }

    function testMultipleBlocks() public {
        game.breakBlock();
        game.breakBlock();
        assertEq(game.getScore(address(this)), 2);
    }
}
