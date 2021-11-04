const KushiToken = artifacts.require("./KushiToken.sol");

module.exports = async function(deployer) {
    await deployer.deploy(KushiToken);
};