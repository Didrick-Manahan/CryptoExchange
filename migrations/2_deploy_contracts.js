const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");


//deploy your smart contracts to the blockchain with this file!

module.exports = async function(deployer) {//need async in order for await to work
  //deploy Token SC
  await deployer.deploy(Token); //need the await keyword here too
  const token = await Token.deployed()

  //deploy EthSwap SC
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed()

  //Transfer all the 1 million tokens to ethSwap
  await token.transfer(ethSwap.address, '1000000000000000000000000')
  //using transfer function from Token.sol
};


//fetches EthSwap smart contract we just created and put it on blockchain

//used to create migrations to put the smart contracts on the blockchain
