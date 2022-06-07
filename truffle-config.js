require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: { //development network that connects to Ganache
      host: "127.0.0.1", //specify connection to blockchain
      port: 7545,
      network_id: "*" // Match any network id
    },
  },
  contracts_directory: './src/contracts/', //where smart contracts live inside project
  contracts_build_directory: './src/abis/',
  compilers: { //which compiler we want to use to compile smart contracts
    solc: {
      //version: "^0.5.0", //added to fix error
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg" //this (along with comma above) might not be needed
    }
  }
}
//*This project is configured to automatically put smart contracts at a different place
  //than where they normally are in the project (we want to access smart contracts from client
  //side application that we build)
//main entry point for application
