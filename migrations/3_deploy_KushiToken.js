const KushiToken = artifacts.require("./KushiToken.sol");
const MasterChef = artifacts.require("./MasterChef.sol");

module.exports = async function(deployer) {
    await deployer.deploy(KushiToken);
    const kushitoken = await KushiToken.deployed;

    await deployer.deploy(MasterChef, "100", "0");
};