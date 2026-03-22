// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev A simple ERC20 token for testing the marketplace.
 * Features:
 *  - Mint tokens to self when deploying.
 *  - Mint more tokens if needed (for ease of testing).
 */
contract MockERC20 is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    // A helper function so testers can get free tokens to try out buying.
    function faucet(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
