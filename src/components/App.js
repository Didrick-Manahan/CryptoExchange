import React, { Component } from 'react' // pulling in "component" from React Library (instaled in package.json)
//import logo from '../logo.png';
//import logo from '../pigeonlogo.PNG';
import Web3 from 'web3' //import Web3 into this file
import './App.css'
import Token from '../abis/Token.json' //import Token abi
import EthSwap from '../abis/EthSwap.json' //import EthSwap abi
import Navbar from './Navbar' //import Navbar component into our App component
import Main from './Main' //import Main component into our App component

class App extends Component { //JSs

  // special life cycle method in React that runs whenever this component is going to get mounted to React virtual dom
  async componentWillMount(){ //method to call loadWeb3()
    await this.loadWeb3()
    await this.loadBlockchainData()
    //console.log(window.web3) //already verified that Web3 is on console log
  }

  async loadBlockchainData(){
    const web3 = window.web3 //shorthand to "web3", so we don't have to retype window

    //grab the user account
    const accounts = await web3.eth.getAccounts()
    //console.log(accounts[0]) //grabs first account out of accounts array
    this.setState({ account: accounts[0] }) //setting 'accounts' value in state object/constructor so we can access in other locaations
    //console.log(this.state.account) //show in console log, we can now call this in render() function!

    const ethBalance = await web3.eth.getBalance(this.state.account)//ethereum balance
    this.setState({ ethBalance: ethBalance}) //key-value same name, then only need one ethBalance if u want

    //load Token smart contract (create javascript version of smart contract so we can interact with its functions)
    const networkId = await web3.eth.getId() // get network ID that we are currently connected to in MetaMask
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      //if token exists, obtain the address
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token: token})
      //we already got ethBalance, now we need tokenBalance of person connected to blockchain through MetaMask
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState ({ tokenBalance: tokenBalance.toString() })
      //console.log("tokenBalance", tokenBalance.toString()) //works correctly
    } else{
      //if token doesn't exist
      window.alert('Token contract not deployed to detected network.') //works!!!
    }

    //load EthSwap smart contract (create javascript version of smart contract so we can interact with its functions)
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      //if ethSwap exists, obtain the address
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap: ethSwap})
    } else{
      //if ethSwap doesn't exist
      window.alert('EthSwap contract not deployed to detected network.') //works!!!
    }
    this.setState({ loading: false})
    //console.log(this.state.ethSwap) //check if ethSwap contract valid

  }

  async loadWeb3() { //async to support await keyword
    //inside here we are going to pull Ethereum provider from MetaMask and expose to our application
    if (window.ethereum) { //for modern web browsers
      /*try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);
      } catch (error) {
        if (error.code === 4001) {
      // User rejected request
        }

        setError(error);
      }*/
      window.web3 = new Web3(window.ethereum) /*Deprecation error*/
      await window.ethereum.enable()
    }
    else if (window.web3) { //for legacy web browsers
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else { //if metamask not installed
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  //wraps smart contract functions
  buyTokens = (etherAmount) =>{
    this.setState({ loading: true})
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) =>{
      this.setState({ loading: false})
    })
  }

  //sellTokens function
  sellTokens = (tokenAmount) => {
    this.setState({ loading: true})
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) =>{
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) =>{
        this.setState({ loading: false})
      })
    })
  }


  //code for obtain React state object
  constructor(props) { //this function gets run anytime component is created
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethbalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() { //render() is function in JS
    let content
    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading...</p>
    } else{
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
        />
    }
    return (
      <div> //all HTML below
        //also, pass React state component to obtain account address/balance
        <Navbar account={this.state.account}/> //new React component rendered out, imported from Navbar.js
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  //href="http://www.dappuniversity.com/bootcamp"
                  href = "https://discord.gg/rsXcT4hW"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
