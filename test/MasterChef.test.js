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
        //kushi per block = 100, start from block 0
        this.chef = await MasterChef.new(this.kushi.address, 100, 0);
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
        it("add lp with alloc point 100", async()=>{
            const txReceipt = await this.chef.add(100, this.lp.address, this.rewarder.address);

            expectEvent(txReceipt, "LogPoolAddition");

            // totalAlloc =100
            const totalAllocPoint = await this.chef.totalAllocPoint();
            expect(totalAllocPoint.toString()).to.equal('100');

            const poolInfo = await this.chef.poolInfo(this.lp.address);
            expect(poolInfo.allocPoint.toString()).to.equal('100');

            console.log("add lp at block", await web3.eth.getBlockNumber());
        });

        it("set lp", async() => {
            await this.chef.set(this.lp.address, 200, constants.ZERO_ADDRESS, false);

            const poolInfo = await this.chef.poolInfo(this.lp.address);
            expect(poolInfo.allocPoint.toString()).to.equal('200');
        });
    });

    describe("deposit and withdraw", () => {
        it("mint lp", async() => {
            await this.lp.mint(user1, 100000);
            await this.lp.mint(user2, 100000);
            await this.lp.mint(user3, 100000);

            expect((await this.lp.balanceOf(user1)).toString()).to.equal('100000');
            expect((await this.lp.balanceOf(user2)).toString()).to.equal('100000');
            expect((await this.lp.balanceOf(user3)).toString()).to.equal('100000');
        });

        it("deposit and check reward", async() => {
            console.log("cur block", await web3.eth.getBlockNumber());
            
            //approve lp from user1 to chef
            await this.lp.approve(this.chef.address, 100, {from: user1});
            //block 0
            await this.chef.deposit(this.lp.address, 100, user1, {from: user1});

            //block 9
            await mineBlock(9);
            //block 10
            await this.chef.updatePool(this.lp.address);
            const pendingkushi = await this.chef.pendingToken(this.lp.address, user1);

            //10block * 100 token per block
            expect(pendingkushi.toString()).to.equal('1000');
            
            //block 11
            await this.chef.withdraw(this.lp.address, 100, user1, {from: user1});
            //block 12
            await this.chef.harvest(this.lp.address, user1, {from: user1});

            const kushiamount = await this.kushi.balanceOf(user1);
            const rewardamount = await this.rewarder.balanceOf(user1);
            expect(kushiamount.toString()).to.equal('1100');
            expect(rewardamount.toString()).to.equal('1100');
        });

        it("deposit from several accounts", async() => {

            await this.lp.approve(this.chef.address, 100, {from: user1});
            await this.lp.approve(this.chef.address, 100, {from: user2});

            //block0
            await this.chef.deposit(this.lp.address, 100, user1, {from: user1});
            await this.chef.deposit(this.lp.address, 100, user2, {from: user2});

            await mineBlock(8);
            //block 10
            await this.chef.updatePool(this.lp.address);
            const user1pendingkushi = await this.chef.pendingToken(this.lp.address, user1);
            const user2pendingkushi = await this.chef.pendingToken(this.lp.address, user2);

            expect(user1pendingkushi.toString()).to.equal('550');
            expect(user2pendingkushi.toString()).to.equal('450');
            console.log("cur block", await web3.eth.getBlockNumber());
        });

        it("withdraw partial", async() => {
            console.log("cur block", await web3.eth.getBlockNumber());
            // block 11
            await this.chef.withdraw(this.lp.address, 75, user2, {from: user2});
            const lpamount = await this.lp.balanceOf(this.chef.address);
            expect(lpamount.toString()).to.equal('125');

            await mineBlock(8);
            //block 20
            await this.chef.updatePool(this.lp.address);
            const user1pendingkushi = await this.chef.pendingToken(this.lp.address, user1);
            const user2pendingkushi = await this.chef.pendingToken(this.lp.address, user2);
            console.log("cur block", await web3.eth.getBlockNumber());
            expect(user1pendingkushi.toString()).to.equal('1320');
            expect(user2pendingkushi.toString()).to.equal('680');
        });

        it("emergencyWithdraw", async() => {
            await this.lp.approve(this.chef.address, 100, {from: user3});
            //block 0
            await this.chef.deposit(this.lp.address, 100, user3, {from: user3});

            await this.chef.emergencyWithdraw(this.lp.address, user3, {from: user3});
            const lpamount = await this.lp.balanceOf(this.chef.address);

            expect(lpamount.toString()).to.equal('125');
        });
    });
});