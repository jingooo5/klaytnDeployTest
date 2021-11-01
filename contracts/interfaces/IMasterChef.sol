pragma solidity ^0.5.6;
//import ownable

import "./IKIP7.sol";

interface IRewarder{
    function t() external;
}

interface IMasterChef{
    struct UserInfo{
        uint256 amount;
        uint256 rewardDebt;
    }

    struct PoolInfo{
        IKIP7 lptoken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accSushiPerShare;
    }

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount, address indexed to);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount, address indexed to);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount, address indexed to);
    event Harvest(address indexed user, uint256 indexed pid, uint256 amount);
    event LogPoolAddition(uint256 indexed _pid, uint256 allocPoint, IKIP7 indexed lpToken, IRewarder indexed rewarder);
    event LogPoolSetting(uint256 indexed _pid, uint256 allocPoint, IRewader indexed rewarder, bool overwritten);
    event LogUpdatePool(uint256 indexed _pid, uint256 lastRewardBlock, uint256 lpSupply, uint256 accKushiPerShare);

    function add(uint256 _allocPoint, IKIP7 _lpToken, IRewarder _rewarder) external;
    function set(uint256 _pid, uint256 _allocPoint, IRewarder _rewarder, bool overwrite) external;
    function pendingTokne(uint256 _pid, address _user) external view returns(uint256);
    function deposit(uint256 _pid, uint256 _amount, address to) external;
    function withdraw(uint256 _pid, uint256 _amount, address to) external;
    function harvest(uint256 _pid, address to) external;
    function withdrawAndHarvest(uint256 _pid, uint256 amount, address to) external;
    function emergencyWithdraw(uint256 _pid, address to) external;
}