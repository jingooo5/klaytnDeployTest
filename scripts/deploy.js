const { ethers } = require("hardhat");

// async function main() {
//     const [deployer] = await ethers.getSigners();
  
//     console.log("Deploying contracts with the account:", deployer.address);
  
//     console.log("Account balance:", (await deployer.getBalance()).toString());
  
//     const Token = await ethers.getContractFactory("Testoken");
//     const token = await Token.deploy();
  
//     console.log("Token address:", token.address);
//   }
  
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });


    async function main() {
      // We get the contract to deploy
      const Testoken = await ethers.getContractFactory("Testoken");
      const testoken = await Testoken.deploy();
    
      console.log("Greeter deployed to:", greeter.address);
    }
    
    main()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });