const { assert, expect } = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
const Web3 = require('web3');
const KushiToken = artifacts.require("./KushiToken.sol");

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
        it("name, symbol, decimal", async() => {
            const _name = await this.kushi.name();
            const _symbol = await this.kushi.symbol();
            const _decimal = await this.kushi.decimal();
    
            assert.equal(name, _name, '');
            assert.equal(symbol, _symbol, '');
            assert.equal(decimal, _decimal, '');
        });

        it("total supply", async() => {
            const totalSupply = await this.kushi.totalSupply();

            assert.equal(totalSupply, 0, '');
        });
    });

    describe("ownership", () => {
        it("owner", async() => {
            assert.equal(await this.kushi.owner(), owner, '');
        })

        it("transfer Ownership", async() => {
            await this.kushi.transferOwnership(user1, {from: owner});
            assert.equal(await this.kushi.owner(), user1, '');

            
            await expectRevert(this.kushi.transferOwnership(owner, {from: owner}), "Ownable: caller is not the owner");
            await expectRevert(this.kushi.transferOwnership(constants.ZERO_ADDRESS
                , {from: user1}), "Ownable: new owner is the zero address");

            await this.kushi.transferOwnership(owner, {from: user1});
            assert.equal(await this.kushi.owner(), owner, '');
        });
    });

    describe("trade", () => {

        it("mint", async() =>{
            await this.kushi.mint(user1, 100);

            const balance = await this.kushi.balanceOf(user1);
            expect(balance.toString()).to.equal("100");
        });

        it("execute mint from not owner", async() =>{
            await expectRevert(this.kushi.mint(user2, 1000, {from: user1}), "Ownable: caller is not the owner");
        });

        it("totalsupply overflow", async() => {
            await expectRevert.unspecified(this.kushi.mint(user2, constants.MAX_UINT256));
        });

        it("delegates", async () => {
            await this.kushi.delegate(user1, {from: user1});
            await this.kushi.mint(user1, 0);
            const vote = await this.kushi.getCurrentVotes(user1);
            expect(vote.toString()).to.equal('100');
            
        });
    });



    // 
    // it("transfer")
    // it("approve, transferfrom")
    // it("delegate")
    // it("eip712, delegate by sig")
    // it("change ownable")

  });