const KushiToken = artifacts.require("KushiToken");

contract("KushiToken", accounts => {
    before("deploy Token", () => {
        KushiToken.deploy()
            .then(instance => instance.getBalance.call(accounts[0]))
            .then(balance => {
                assert.equal(
                    balance.valueOf(),
                    10000,
                    "10000 wasn't in the first account"
                );
            })
    })
})