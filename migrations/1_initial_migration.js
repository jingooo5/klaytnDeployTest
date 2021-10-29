const Migrations = artifacts.require("./Testoken.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
