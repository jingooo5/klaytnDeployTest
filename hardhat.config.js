/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const fs = require('fs');
const privateKey = fs.readFileSync("./.secret").toString();
const access_key_id = JSON.parse(fs.readFileSync("./kas-access-keys.json")).accessKeyId;
const secret_access_key = JSON.parse(fs.readFileSync("./kas-access-keys.json")).secretAccessKey;
require("@nomiclabs/hardhat-waffle");

const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
  // accountsBalance: "990000000000000000000",
}

module.exports = {
  solidity: "0.5.6",
  networks: {
    baobab: {
      url: "https://api.baobab.klaytn.net:8651",
      accounts: [privateKey],
      chainId: 1001,
      gas: 8500000,
      gasPrice: 2500000000,
    }
  }
}