const { assert, expect } = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
const Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');

const KushiToken = artifacts.require("./KushiToken.sol");
const MasterChef = artifacts.require("./MasterChef.sol");
const KIP7mock = artifacts.require("./mocks/KIP7mintable.sol");
const Rewarder = artifacts.require("./mocks/RewarderMock.sol");

async function mineBlock(times){
    for(let i = 0; i < times; i++){
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            params:[],
            id: new Date().getTime(),
        }, function(err) {
            if(err)
                console.log(err);
      });
    }
}

contract("MasterChef", ([owner, user1, user2, user3])=>{
    const name = "Kushitoken";
    const symbol = "KUSHI";
    const decimal = 18;

    before(async () => {
        this.kushi = await KushiToken.new();
        this.lp = await KIP7mock.new("lp", "LP", 18);
        this.chef = await MasterChef.new(this.kushi.address, 1000, 155);
        this.rewarder = await Rewarder.new(1, this.chef.address);

        await this.kushi.transferOwnership(this.chef.address);
        expect(await this.kushi.owner()).to.equal(this.chef.address);
    });

    describe("Tokens", () => {
        it("LP name, symbol, decimal", async() => {
            const _name = await this.lp.name();
            const _symbol = await this.lp.symbol();
            const _decimal = await this.lp.decimal();
    
            assert.equal("lp", _name, '');
            assert.equal("LP", _symbol, '');
            assert.equal(18, _decimal, '');
        });

        it("kushi name, symbol, decimal", async() => {
            const _name = await this.kushi.name();
            const _symbol = await this.kushi.symbol();
            const _decimal = await this.kushi.decimal();
    
            assert.equal(name, _name, '');
            assert.equal(symbol, _symbol, '');
            assert.equal(decimal, _decimal, '');
        });

        it("rewarder name, symbol, decimal", async() => {
            const _name = await this.rewarder.name();
            const _symbol = await this.rewarder.symbol();
            const _decimal = await this.rewarder.decimal();

            assert.equal("reward", _name, '');
            assert.equal("RWD", _symbol, '');
            assert.equal(18, _decimal, '');
        });
    });

    describe("add and set", () => {
        it("add lp", async()=>{
            const txReceipt = await this.chef.add(100, this.lp.address, this.rewarder.address);

            expectEvent(txReceipt, "LogPoolAddition");

            const totalAllocPoint = await this.chef.totalAllocPoint();
            expect(totalAllocPoint.toString()).to.equal('100');

            const poolInfo = await this.chef.poolInfo(this.lp.address);
            expect(poolInfo.allocPoint.toString()).to.equal('100');
        });

        it("set lp", async() => {
            await this.chef.set(this.lp.address, 200, constants.ZERO_ADDRESS, false);

            const poolInfo = await this.chef.poolInfo(this.lp.address);
            expect(poolInfo.allocPoint.toString()).to.equal('200');
        });
    });

    describe("deposit and withdraw", () => {
        it("mint lp", async() => {
            await this.lp.mint(user1, 500000);
            await this.lp.mint(user2, 500000);
            await this.lp.mint(user3, 500000);

            expect((await this.lp.balanceOf(user1)).toString()).to.equal('500000');
            expect((await this.lp.balanceOf(user2)).toString()).to.equal('500000');
            expect((await this.lp.balanceOf(user3)).toString()).to.equal('500000');
        });

        it("deposit 100000lp from user1", async () => {
            await this.lp.approve(this.chef.address, 100000, {from: user1});
            await this.chef.deposit(this.lp.address, 100000, user1, {from: user1});

            //expect((await this.chef.poolInfo(this.lp.address)).accSushiPerShare).to.gt(new BN(0));
            expect((await this.lp.balanceOf(this.chef.address)).toString()).to.equal('100000');
        });

        it("deposit 400000lp from user1", async () => {
            await this.lp.approve(this.chef.address, 400000, {from: user1});
            await this.chef.deposit(this.lp.address, 400000, user1, {from: user1});
            await mineBlock(1);

            //expect((await this.chef.poolInfo(this.lp.address)).accSushiPerShare).to.gt(new BN(0));
            console.log(await this.chef.poolInfo(this.lp.address));
            expect((await this.lp.balanceOf(this.chef.address)).toString()).to.equal('500000');
        });

        it("pedingTokens", async() => {
            //await web3.eth.getBlockNumber(console.log);
            await mineBlock(5);
            //await web3.eth.getBlockNumber(console.log);
            const pending = await this.chef.pendingToken(this.lp.address, user1);
            console.log(pending.toString());
        })
    })


});