const Testoken = artifacts.require("./Testoken.sol");

module.exports = async (deployer) => {
  const token = awiat Testoken.new();
  Testoken.setAsDeployed(token);
};
