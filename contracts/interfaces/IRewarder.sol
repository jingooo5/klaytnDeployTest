// SPDX-License-Identifier: MIT
pragma solidity ^0.5.6;

import "./IKIP7.sol";
//import "@boringcrypto/boring-solidity/contracts/libraries/BoringERC20.sol";
interface IRewarder {
    //using BoringERC20 for IERC20;
    function onSushiReward(address lp, address user, address recipient, uint256 sushiAmount, uint256 newLpAmount) external;
    function pendingTokens(address lp, address user, uint256 sushiAmount) external view returns (IKIP7[] memory, uint256[] memory);
}
