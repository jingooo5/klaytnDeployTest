const KushiToken = artifacts.require("./KushiToken.sol");
const MasterChef = artifacts.require("./MasterChef.sol");

module.exports = async function(deployer) {
    await deployer.deploy(KushiToken);
    const kushitoken = await KushiToken.deployed();

    //console.log(kushitoken.address);
    await deployer.deploy(MasterChef, kushitoken.address, "100", "0");
};