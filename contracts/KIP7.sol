pragma solidity ^0.7.0;

import "./interfaces/IKIP7.sol";
import "./libraries/SafeMath.sol";

contract KIP7 is IKIP7{
    using SafeMath for uint256;

    string private _name;
    string private _symbol;
    uint256 private _decimal;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    uint256 internal _totalSupply;

    constructor (string memory name, string memory symbol, uint256 decimal) public {
        _name = name;
        _symbol = symbol;
        _decimal = decimal;
    }

    function name() public view returns (string memory){
        return _name;
    }

    function symbol() public view returns (string memory){
        return _symbol;
    }

    function decimal() public view returns (uint256) {
        return _decimal;
    }

    function totalSupply() public view returns(uint256){
        return _totalSupply;
    }

    function balanceOf(address account) public view returns(uint256){
        return balances[account];
    }

    function allownace(address owner, address spender) public view returns(uint256){
        return allowances[owner][spender];
    }

    function transfer(address recipient, uint256 amount) external returns (bool){
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool){
        _approve(msg.sender, spender, amount);
        return true;
    }

    function trasferFrom(address sender, address recipient, uint256 amount) external returns(bool){
        _transfer(sender, recipient, amount);

        uint256 _allownace = allowances[sender][msg.sender];
        require(_allownace >= amount);
        _approve(sender, msg.sender, _allownace - amount);

        return true;
    }

    function _approve(address owner, address spender, uint256 amount) internal{
        require(owner != address(0));
        require(spender != address(0));

        allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal{
        require(to != address(0));
        require(from != address(0));

        uint256 senderBalance = balances[from];
        require(senderBalance >= amount);
        balances[from] = senderBalance - amount;

        balances[to] = balances[to].add(amount);

        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0));

        _totalSupply.add(amount);
        balances[to].add(amount);
        
        emit Transfer(address(0), to, amount);
    }

}