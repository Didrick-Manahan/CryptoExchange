//all the tests written in javascript
//Truffle gives us a way to write tests for Solidity smart contracts in javascript

//we need to first import the smart contract like in Migrations file
const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

//configure Chai Assertions
require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) { //n = # of tokens
  //human readable function
  return web3.utils.toWei(n, 'ether') //convert Ether into Wei (or DApp tokens to Wei?)
}

contract('EthSwap', ([deployer, investor]) => { //pass in callback function with arrow
//deployer references first account inside Ganache, second account is investor


//all test written inside here

  let token, ethSwap //need to declare here so functions inside 'describe' know what the variables inside 'before hooks' are

  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)//makes EthSwap contract aware of token inside test as well
    //Transfer all tokens (1 million) to EthSwap
    await token.transfer(ethSwap.address, tokens('1000000'))
    //the number above doesn't look like 1 million...
    //this token has 18 decimal places behind a zero

  })

  //we can write tests for the Token as well
  describe('Token deployment', async () => {
    it('contract has a name', async ()=> { //this is what we observed in console
        //we are just checking for same thing inside the test
        const name = await token.name()
        assert.equal(name, 'DApp Token')
    })
  })


  //basic test that ensures smart contract was deployed to the network
  //fetch smart contracts and perform operations like we did in console
  describe('EthSwap deployment', async () => {
    it('contract has a name', async ()=> { //this is what we observed in console
        //we are just checking for same thing inside the test
        const name = await ethSwap.name()
        assert.equal(name, 'EthSwap Instant Exchange')

    })

    //test to make sure smart contract has tokens
    it('contract has tokens', async () =>{
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))

    })

  })
  //test for buytokens function in EthSwap contract
  describe('buyTokens()', async () => {
    let result
    before(async () => {
      //Purchase tokens before each example
      result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')}) //1 ethereum
    })

    it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
      //check investor token balance after purhcase
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100')) //make sure investor has his 100 tokens

      //check ethSwap Balance after Purchase
      let ethSwapBalance
      ethSwapBalance = await token.balanceOf(ethSwap.address) //make sure ethSwap has 1 mil - 100 tokens
      assert.equal(ethSwapBalance.toString(), tokens('999900'))
      //check to see if ethereum balance went up
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)//ethereum balance
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether')) //make sure it went up 1 eth

      //inspect event (that token was purchased)
      const event = result.logs[0].args
      //above gives us account, token, ammount, and rate from event created in EthSwap.sol
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })
  })

  //test for sellTokens in EthSwap smart contract
  describe('sellTokens()', async () => {
    let result
    before(async () => {
      //investor must approve tokens before the purchase
      await token.approve(ethSwap.address, tokens('100'), { from: investor }) //we want ethSwap to spend the tokens for us
      //Investor sells tokens
      result = await ethSwap.sellTokens(tokens('100'), { from: investor }) //1 ethereum
    })

    it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {

      //check investor balance (# of tokens) went down
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0')) //make sure investor was deducted his 100 tokens

      //check ethSwap Balance after Sell (make sure # of tokens went up!)
      let ethSwapBalance
      ethSwapBalance = await token.balanceOf(ethSwap.address) //make sure ethSwap has 1 mil tokens again
      assert.equal(ethSwapBalance.toString(), tokens('1000000'))
      //check to see if ethereum balance went down
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)//ethereum balance
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether')) //make sure 1 eth was dedcuted from ethSwap

      //inspect event (that token was sold)
      //check logs to ensure the event was emitted with correct data
      const event = result.logs[0].args
      //above gives us account, token, ammount, and rate from sold event created in EthSwap.sol
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      //FAILURE: investor cannot sell more tokens than they have
      await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;

    })
  })

})
