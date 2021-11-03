pragma solidity ^0.5.6;

import "./interfaces/IKIP7.sol";
import "./interfaces/IMasterChef.sol";
import "./Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";
import "./KushiToken.sol";
import "./libraries/SignedSafeMath.sol";

contract MasterChef is IMasterChef, Ownable{
    using SafeMath for uint256;
    using SafeERC20 for IKIP7;
    using SignedSafeMath for int256;

    KushiToken public kushi;

    //lpToken => poolInfo
    mapping(address => PoolInfo) public poolInfo;
    //lpToken => useraddress => info
    mapping(address => mapping(address => UserInfo)) public userInfo;

    uint256 private constant ACC_SUSHI_PRECISION = 1e12;
    
    //PoolInfo[] public poolInfo;
    //IKIP7[] public lpToken;
    //IRewarder[] public rewarder;

    //mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 public totalAllocPoint;

    uint256 public kushiPerBlock;
    uint256 public startBlock;

    constructor(address _KushiToken, uint256 _kushiPerBlock, uint256 _startBlock) public Ownable() {
        startBlock = _startBlock;
        kushiPerBlock = _kushiPerBlock;
        kushi = KushiToken(_KushiToken);
    }

    function add(uint256 _allocPoint, address _lpToken, IRewarder _rewarder) external onlyOwner{
        require(address(poolInfo[_lpToken].lpToken) == address(0), "pool Already exist");

        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);

        poolInfo[_lpToken] = PoolInfo({
            lpToken: IKIP7(_lpToken),
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accSushiPerShare: 0,
            rewarder: _rewarder
        });
        emit LogPoolAddition(_lpToken, _allocPoint, IKIP7(_lpToken), _rewarder);
    }

    //using cache
    function set(address _lp, uint256 _allocPoint, IRewarder _rewarder, bool overwrite) external onlyOwner{
        PoolInfo memory pool = poolInfo[_lp];
        totalAllocPoint = totalAllocPoint.sub(pool.allocPoint).add(_allocPoint);

        pool.allocPoint = _allocPoint;
        if(overwrite)
            pool.rewarder = _rewarder;
        poolInfo[_lp] = pool;
        emit LogPoolSetting(_lp, _allocPoint, _rewarder, overwrite);
    }

    function pendingToken(address _lp, address _user) public view returns(uint256 pending){
        PoolInfo memory pool = poolInfo[_lp];
        UserInfo memory user = userInfo[_lp][_user];

        uint256 accSushiPerShare = pool.accSushiPerShare;
        uint256 lpSupply = IKIP7(pool.lpToken).balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 blocks = block.number.sub(pool.lastRewardBlock);
            uint256 kushiReward = blocks.mul(kushiPerBlock).mul(pool.allocPoint) / totalAllocPoint;
            accSushiPerShare = accSushiPerShare.add(kushiReward.mul(ACC_SUSHI_PRECISION) / lpSupply);
        }
        pending = int256(user.amount.mul(accSushiPerShare) / ACC_SUSHI_PRECISION).sub(user.rewardDebt).toUInt256();
    }

    function _updatePool(address _lp) internal returns (PoolInfo memory pool) {
        pool = poolInfo[_lp];
        if (block.number > pool.lastRewardBlock) {
            uint256 lpSupply = pool.lpToken.balanceOf(address(this));

            if (lpSupply > 0) {
                uint256 blocks = block.number.sub(pool.lastRewardBlock);
                uint256 sushiReward = blocks.mul(kushiPerBlock).mul(pool.allocPoint) / totalAllocPoint;
                pool.accSushiPerShare = pool.accSushiPerShare.add((sushiReward.mul(ACC_SUSHI_PRECISION) / lpSupply));
            }
            pool.lastRewardBlock = block.number;
            poolInfo[_lp] = pool;
            emit LogUpdatePool(_lp, pool.lastRewardBlock, lpSupply, pool.accSushiPerShare);
        }
    }

    function updatePool(address _lp) external {
        //require(poolInfo[_lp] != 0, "updating not existing pool");
        _updatePool(_lp);
    }

    function massUpdatePools(address[] memory lps) public {
        uint256 length = lps.length;
        for (uint256 pool = 0; pool < length; ++pool) {
            _updatePool(lps[pool]);
        }
    }

    function deposit(address _lp, uint256 _amount, address to) external{
        require(to != address(0), "deposit for address 0");

        PoolInfo memory pool = _updatePool(_lp);
        UserInfo memory usercache = userInfo[_lp][to];

        // Effects
        usercache.amount = usercache.amount.add(_amount);
        usercache.rewardDebt = usercache.rewardDebt.add(int256(_amount.mul(pool.accSushiPerShare) / ACC_SUSHI_PRECISION));

        // Interactions
        IRewarder _rewarder = pool.rewarder;
        if (address(_rewarder) != address(0)) {
            _rewarder.onSushiReward(_lp, to, to, 0, usercache.amount);
        }

        pool.lpToken.safeTransferFrom(msg.sender, address(this), _amount);
        userInfo[_lp][to] = usercache;

        emit Deposit(msg.sender, _lp, _amount, to);
    }

    /// @notice Withdraw LP tokens from MCV2.
    /// @param to Receiver of the LP tokens.
    function withdraw(address _lp, uint256 _amount, address to) external {
        PoolInfo memory pool = _updatePool(_lp);
        UserInfo memory userCache = userInfo[_lp][msg.sender];

        // Effects
        userCache.rewardDebt = userCache.rewardDebt.sub(int256(_amount.mul(pool.accSushiPerShare) / ACC_SUSHI_PRECISION));
        userCache.amount = userCache.amount.sub(_amount);

        // Interactions
        IRewarder _rewarder = pool.rewarder;
        if (address(_rewarder) != address(0)) {
            _rewarder.onSushiReward(_lp, msg.sender, to, 0, userCache.amount);
        }
        
        pool.lpToken.safeTransfer(to, _amount);
        userInfo[_lp][msg.sender] = userCache;

        emit Withdraw(msg.sender, _lp, _amount, to);
    }

    /// @notice Harvest proceeds for transaction sender to `to`.
    /// @param to Receiver of SUSHI rewards.
    function harvest(address _lp, address to) external {
        PoolInfo memory pool = _updatePool(_lp);
        UserInfo memory userCache = userInfo[_lp][msg.sender];
        int256 accumulatedSushi = int256(userCache.amount.mul(pool.accSushiPerShare) / ACC_SUSHI_PRECISION);
        uint256 _pendingSushi = accumulatedSushi.sub(userCache.rewardDebt).toUInt256();

        // Effects
        userCache.rewardDebt = accumulatedSushi;

        // Interactions
        if (_pendingSushi != 0) {
            kushi.mint(to, _pendingSushi);
        }
        
        IRewarder _rewarder = pool.rewarder;
        if (address(_rewarder) != address(0)) {
            _rewarder.onSushiReward( _lp, msg.sender, to, _pendingSushi, userCache.amount);
        }
        userInfo[_lp][msg.sender] = userCache;

        emit Harvest(msg.sender, _lp, _pendingSushi);
    }

    /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
    /// @param to Receiver of the LP tokens.
    function emergencyWithdraw(address _lp, address to) external {
        UserInfo memory userCache = userInfo[_lp][msg.sender];
        uint256 amount = userCache.amount;
        userCache.amount = 0;
        userCache.rewardDebt = 0;

        IRewarder _rewarder = poolInfo[_lp].rewarder;
        if (address(_rewarder) != address(0)) {
            _rewarder.onSushiReward(_lp, msg.sender, to, 0, 0);
        }

        // Note: transfer can fail or succeed if `amount` is zero.
        poolInfo[_lp].lpToken.safeTransfer(to, amount);
        userInfo[_lp][msg.sender] = userCache;
        emit EmergencyWithdraw(msg.sender, _lp, amount, to);
    }

}