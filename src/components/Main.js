import React, { Component } from 'react' // pulling in "component" from React Library (instaled in package.json)
import BuyForm from './BuyForm'
import SellForm from './SellForm'

//import logo from '../logo.png'
//import pigeonLogo from '../pigeonlogo.PNG'
//import tokenLogo from '../token-logo.png'
//import ethLogo from '../eth-logo.png'


class Main extends Component { //JS

  constructor(props) { //this function gets run anytime component is created
    super(props)
    this.state = {
      currentForm: 'buy'
    }
  }


  render() { //render() is function in JS
    let content
    if(this.state.currentForm === 'buy'){
      content = <BuyForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        buyTokens={this.props.buyTokens}
      />
    } else{
      content = <SellForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        sellTokens={this.props.sellTokens}
      />
    }
    return (
      <div id="content" className ="mt-3">

        <div className="d-flex justify-content-between mb-3">
          <button
              className="btn btn-light"
              onClick={(event) => {
                this.setState({ currentForm: 'buy' })
              }}
            >
            Buy
          </button>
          <span className="text-muted">&lt; &nbsp; &gt;</span>
          <button
              className="btn btn-light"
              onClick={(event) => {
                this.setState({ currentForm: 'sell' })
              }}
            >
            Sell
          </button>
        </div>

        <div className="card mb-4" >

          <div className="card-body">

            {content}

          </div>
        </div>
      </div>
    );
  }
}

export default Main;
