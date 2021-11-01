/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const fs = require('fs');
const privateKey = fs.readFileSync("./.secret").toString();
const access_key_id = JSON.parse(fs.readFileSync("./kas-access-keys.json")).accessKeyId;
const secret_access_key = JSON.parse(fs.readFileSync("./kas-access-keys.json")).secretAccessKey;


module.exports = {
  solidity: "0.5.6",
  networks: {
    baobab: {
      url: "https://node-api.klaytnapi.com/v1/klaytn",
      accounts:[privateKey],
      httpHeaders:
        {
          name: "Authorization",
          value:
            "Basic " +
            Buffer.from(access_key_id + ":" + secret_access_key).toString(
              "base64"
            ),
        },
      chainId: 1001,
      gas: 8500000,
      gasPrice: 25000000000,
    }
  }
}