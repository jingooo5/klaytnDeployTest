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
      // httpHeaders:
      //   {
      //     "Authorization":
          
      //       "Basic " +
      //       Buffer.from(access_key_id + ":" + secret_access_key).toString(
      //         "base64"
      //       ),
      //       "x-chain-id": "1001"
      //   },
      accounts: [privateKey],
         }
  }
}