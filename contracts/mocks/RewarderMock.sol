// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;
import "../interfaces/IRewarder.sol";
import "../KIP7.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";



contract RewarderMock is KIP7, IRewarder {
    using SafeMath for uint256;
    using SafeERC20 for IKIP7;
    uint256 private rewardMultiplier;
    IKIP7 private rewardToken;
    uint256 private constant REWARD_TOKEN_DIVISOR = 1e18;
    address private MASTERCHEF_V2;

    constructor (uint256 _rewardMultiplier, address _MASTERCHEF_V2) public KIP7("reward", "RWD", 18) {
        rewardMultiplier = _rewardMultiplier;
        MASTERCHEF_V2 = _MASTERCHEF_V2;
    }

    function onSushiReward (address, address, address to, uint256 sushiAmount, uint256) onlyMCV2 external {
        uint256 pendingReward = sushiAmount.mul(rewardMultiplier) / REWARD_TOKEN_DIVISOR;
        //uint256 rewardBal = rewardToken.balanceOf(address(this));
        _mint(to, pendingReward);
    }
    
    function pendingTokens(address, address, uint256 sushiAmount) external view returns (IKIP7[] memory rewardTokens, uint256[] memory rewardAmounts) {
        IKIP7[] memory _rewardTokens = new IKIP7[](1);
        _rewardTokens[0] = (this);
        uint256[] memory _rewardAmounts = new uint256[](1);
        _rewardAmounts[0] = sushiAmount.mul(rewardMultiplier) / REWARD_TOKEN_DIVISOR;
        return (_rewardTokens, _rewardAmounts);
    }

    modifier onlyMCV2 {
        require(
            msg.sender == MASTERCHEF_V2,
            "Only MCV2 can call this function."
        );
        _;
    }
  
}
