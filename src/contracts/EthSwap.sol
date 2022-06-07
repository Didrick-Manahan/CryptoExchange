pragma solidity ^0.5.0; // this didn't work...why??? IDK maybe forgot colon hehe
//pragma solidity >=0.4.21 <0.6.0;

//import Dapp Token contract into this contract file
import "./Token.sol";

contract EthSwap {
  //test or demonstration to see how it works

  //state variables (stored on blockchain)
  string public name = "EthSwap Instant Exchange"; //public allows you to read it outside of smart contract

  //we want to keep track of Token in smart contracts
  Token public token; //creates a variable that represents the token smart contract
  //this only gives code for smart contract, doesn't specify where this is on the blockchain

  uint public rate = 100; //no decimal places and cannot be negative

  //define an event for buyTokens
  event TokensPurchased(
    address account, //account of token buyer
    address token,   //token address thats being bought
    uint amount,
    uint rate //redemption rate
    );


  //define an event for buyTokens
  event TokensSold(
    address account, //account of token seller
    address token,   //token address thats being sold
    uint amount,
    uint rate //redemption rate
    );


  //tell EthSwap contract where Token contract is located (address)
  //create a function that runs/pass in address whenever smart contract is deployed to the network
  constructor(Token _token) public { //runs once AND ONLY ONCE whenever this contract gets deployed to blockchain
    token = _token; //gives us a token we can interact with
    //this also makes sure _token gets stored in blockchain (_token is a local variable otherwise)

  }

  //create a way to buy the tokens
  function buyTokens() public payable {
    //redemption rate = # of tokens recieved for 1 ethereum
    //amount of ethereum * redemption rate (calculate # of tokens to buy)
    uint tokenAmount = msg.value * rate; //value tells us how much ether was sent whenever this function called
    //transfer tokens from EthSwap contract to the person thats buying them

    //Requirement that exchange has enough tokens for asked transfer ammount
    require(token.balanceOf(address(this)) >= tokenAmount); //is this redundant? (require already in transfer function)

    token.transfer(msg.sender, tokenAmount); //obtains the address of person who called the function
    //transfer function for ERC-20 tokens

    // Emit an event (that tokens were purchased)
    emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);

  }

  function sellTokens(uint _amount) public { //amount is # of DApp (ERC-20) tokens

    //User cannot sell more tokens than they have
    require(token.balanceOf(msg.sender) >= _amount); //this is redundant

    //calculate amount of Ether to redeem
    uint etherAmount = _amount / rate;

    //Requirement that exchange has enough ether to send back to investor
    require(address(this).balance >= etherAmount); //is this redundant? (require already in transfer function)

    //Perform Sale (give investor that much ether depending on amount of tokens)
    token.transferFrom(msg.sender, address(this), _amount); //transfer tokens from investor to ethswap exchange
    //transferFrom is special function anytime you want smart contract to spend your tokens for you
    msg.sender.transfer(etherAmount); //transfer Ethereum to investor, not ERC-20 tokens

    //Emit an event (that tokens were sold)
    emit TokensSold(msg.sender, address(token), _amount, rate);


  }


}











//this is smart contract where create buying/selling tokens

//were going to write Solidity source code for smart contract
