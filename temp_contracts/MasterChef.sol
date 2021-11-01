pragma solidity ^0.5.6;

import "./interfaces/IKIP7.sol";
import "./interfaces/IMasterChef.sol";
import "./Ownable.sol";

contract MasterChef is IMasterChef, onlyOwner{
    using safeMath for uint256;

    struct UserInfo{
        uint256 amount;
        uint256 rewardDebt;
    }

    struct PoolInfo{
        IKIP7 lpToken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accSushiPerShare;
    }

    KushiToken public kushi;

    mapping(address => PoolInfo) poolInfo;
    mapping()
    
    //PoolInfo[] public poolInfo;
    //IKIP7[] public lpToken;
    //IRewarder[] public rewarder;

    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 public totalAllocPoint;

    uint256 public kushiPerBlock;
    uint256 public startBlock;

    constructor(IKIP7 _KushiToken, uint256 _kushiPerBlock, uint256 _startBlock) public {
        startBlock = _startBlock;
        kushiPerBlock = _kushiPerBlock;
        kushi = _KushiToken;
    }

    function add(uint256 _allocPoint, IKIP7 _lpToken, IRewarder _rewarder) external onlyOwner{
        uint256 lastRewardBlock = block.number;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);

        PoolInfo.push(poolInfo({
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accSushiPerShare: 0
        }));

        lpToken.push(_lpToken);
        rewarder.push(_rewarder);

        emit LogPoolAddition(PoolInfo.length-1, _allocPoint, _lpToken, _rewarder);
    }

    function set(uint256 _pid, uint256 _allocPoint, IRewarder _rewarder, bool overwrite) external onlyOwner{
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        PoolInfo storage pool = poolInfo[_pid];
        pool.allocPoint = _allocPoint;
        if(overwrite)
                
    }


}