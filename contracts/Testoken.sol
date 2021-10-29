pragma solidity ^0.5.6;

import "./libraries/SafeMath.sol";
import "./KIP7.sol";

contract Testoken is KIP7("Testoken", "TST", 18){
    using SafeMath for uint256;
    function mint(address to, uint256 amount) external returns(bool){
        _mint(to, amount);
        return true;
    }
}