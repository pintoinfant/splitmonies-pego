// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAI is ERC20 {
    uint256 public INITIAL_SUPPLY = 1000000000000000000000000000;

    constructor() ERC20("DAI", "DAI") {
        _mint(msg.sender, 1000000);
        _mint(address(this), INITIAL_SUPPLY/2 * (10**uint256(decimals())));
    }
}