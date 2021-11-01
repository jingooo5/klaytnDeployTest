pragma solidity ^0.5.6;
//import ownable

import "./IKIP7.sol";
import "./IRewarder.sol";

interface IMasterChef{
    struct UserInfo{
        //lptoken amount
        uint256 amount;
        //received reward
        uint256 rewardDebt;
    }

    struct PoolInfo{
        IKIP7 lpToken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accSushiPerShare;
        IRewarder rewarder;
    }

    event Deposit(address indexed user, address indexed lpAddr, uint256 amount, address indexed to);
    event Withdraw(address indexed user, address indexed lpAddr, uint256 amount, address indexed to);
    event EmergencyWithdraw(address indexed user, address indexed lp, uint256 amount, address indexed to);
    event Harvest(address indexed user, address indexed lp, uint256 amount);
    event LogPoolAddition(address indexed _lp, uint256 allocPoint, IKIP7 indexed lpToken, IRewarder indexed rewarder);
    event LogPoolSetting(address indexed _lp, uint256 allocPoint, IRewarder indexed rewarder, bool overwritten);
    event LogUpdatePool(address indexed lp, uint256 lastRewardBlock, uint256 lpSupply, uint256 accKushiPerShare);

    function add(uint256 _allocPoint, address _lpToken, IRewarder _rewarder) external;
    function set(uint256 _lp, uint256 _allocPoint, IRewarder _rewarder, bool overwrite) external;
    function pendingTokne(address _lp, address _user) external view returns(uint256);
    function deposit(address _lp, uint256 _amount, address to) external;
    function withdraw(address _lp, uint256 _amount, address to) external;
    function harvest(address _lp, address to) external;
    //function withdrawAndHarvest(uint256 _pid, uint256 amount, address to) external;
    function emergencyWithdraw(address _lp, address to) external;
}