const { assert, expect } = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const Web3 = require('web3');
const KushiToken = artifacts.require("./KushiToken.sol");
require("dotenv").config();

var web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');

//const [owner, user1, user2, user3] = web3.eth.getAccounts();


contract("Kushitoken", ([owner, user1, user2, user3]) => {
    const name = "Kushitoken";
    const symbol = "KUSHI";
    const decimal = 18;

    before(async () => {
        this.kushi = await KushiToken.new();
        //console.log(this.kushi.address);
    });

    describe("datas", () => {
        it("name, symbol, decimal", async () => {
            const _name = await this.kushi.name();
            const _symbol = await this.kushi.symbol();
            const _decimal = await this.kushi.decimal();

            assert.equal(name, _name, '');
            assert.equal(symbol, _symbol, '');
            assert.equal(decimal, _decimal, '');
        });

        it("total supply", async () => {
            const totalSupply = await this.kushi.totalSupply();

            assert.equal(totalSupply, 0, '');
        });
    });

    describe("ownership", () => {
        it("owner", async () => {
            assert.equal(await this.kushi.owner(), owner, '');
        })

        it("transfer Ownership", async () => {
            await this.kushi.transferOwnership(user1, { from: owner });
            assert.equal(await this.kushi.owner(), user1, '');


            await expectRevert(this.kushi.transferOwnership(owner, { from: owner }), "Ownable: caller is not the owner");
            await expectRevert(this.kushi.transferOwnership(constants.ZERO_ADDRESS
                , { from: user1 }), "Ownable: new owner is the zero address");

            await this.kushi.transferOwnership(owner, { from: user1 });
            assert.equal(await this.kushi.owner(), owner, '');
        });
    });

    describe("trade", () => {

        it("mint", async () => {
            await this.kushi.mint(user1, 100);

            const balance = await this.kushi.balanceOf(user1);
            expect(balance.toString()).to.equal("100");
        });

        it("execute mint from not owner", async () => {
            await expectRevert(this.kushi.mint(user2, 1000, { from: user1 }), "Ownable: caller is not the owner");
        });

        it("totalsupply overflow", async () => {
            await expectRevert.unspecified(this.kushi.mint(user2, constants.MAX_UINT256));
        });

        // it("delegates", async () => {
        //     await this.kushi.delegate(user1, { from: user1 });
        //     await this.kushi.mint(user1, 0);
        //     const vote = await this.kushi.getCurrentVotes(user1);
        //     expect(vote.toString()).to.equal('100');

        // });

        // it("delegate with sig", async () => {

        //     const nonce = await this.kushi.nonces(user3);

        //     const typedData = {
        //         types: {
        //             EIP712Domain: [
        //                 { name: "name", type: "string" },
        //                 { name: "chainId", type: "uint256" },
        //                 { name: "verifyingContract", type: "address" }
        //             ],
        //             Delegation: [
        //                 { name: "delegatee", type: "address" },
        //                 { name: "nonce", type: "uint256" },
        //                 { name: "expiry", type: "uint256" }
        //             ]
        //         },
        //         primaryType: "Delegation",
        //         domain: { name: "KushiToken", chainId: '5777', verifyingContract: this.kushi.address },
        //         message: {
        //             delegatee: user1,
        //             nonce: nonce,
        //             expiry: 1736083270
        //         }
        //     }
        //     web3.eth.getBlock('latest').then((block) => {
        //         console.log(block.timestamp);
        //     })
        //     // web3.currentProvider.send({
        //     //     method : 'eth_signTypedData',
        //     //     params: [user2, JSON.stringify(typedData)],
        //     //     from: user2
        //     // }, console.log);

        //     const data = await web3.eth.sign(JSON.stringify(typedData), user3, true);
        //     console.log(user3);
        //     console.log(user1);
        //     console.log(nonce);
        //     const recover = web3.eth.accounts.recover(JSON.stringify(typedData), data);

        //     const signature = "1d2e9c6b7e8d45d87c0a75f5da622b82986a5c054209c2916868ed3b5563c9ee1c340215c8cc73b48fd0ff91460d2a84472923fc78fe4d8cf7d9b3e6707cf6711b";
        //     const r = "0x" + signature.substring(0,64);
        //     const s = "0x" + signature.substring(64,128);
        //     const v = parseInt(signature.substring(128,130), 16);

        //     // console.log("signatory :", recover);
            
        //     //const sign = "0xc3c687d13588a46049b8b0e72ff2bfb0dd332efbe5271b66c2a4fe6171a8dd7d794e001e4f0ada1906734b2b08c478b02447b6a69862d2ffc7dcf2efccd0beaa1c";
        //     await this.kushi.delegateBySig(user1, nonce, 173608327, v, r, s, {from: user3});
        //     expect(await this.kushi.delegates(user3)).to.equal(user1);

        // });
    });

});