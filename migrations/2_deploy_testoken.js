const Testoken = artifacts.require("./Testoken.sol");

module.exports = function(deployer) {
  deployer.deploy(Testoken);
};
