import React from "react";
import { Grid, Table, Segment, Header, Form, Button } from "semantic-ui-react";
import TokensTemplate from "./TokensTemplate"
import MasterPOCContract from "../contracts/MasterPOC.json"
import Web3Container from "../utils/Web3Container"

class OwnedTokens extends React.Component {

  componentDidMount = async () => {
    const {web3, accounts, contract} = this.props;
    
    // May not have public getter yet in Master contract
    const tokenContracts = await contract.methods.getContracts().call({from: accounts[0], gas: 300000})

    // Object which shows all the owners for each token: {address => address[]}
    const tokenOwnershipByToken = tokenContracts.map(async curr => {
      const uniqueAddresses = await getAddresesByToken(curr)
      return {curr: uniqueAddresses}
    })
    
    // Filter above for active MetaMask user's tokens 
    const myTokens = tokenOwnershipByToken.map(curr => {
    })
  }

  getAddresesByToken = async (tokenContract) => {
    const {web3, accounts, contract} = this.props;

    // Get log of Transfer events from specified token contract address
    const transferEvents = await tokenContract.getPastEvents("Transfer", {
      fromBlock: 0,
      toBlock: "latest"
    });  

    // Filter the Event for unique holder addresses
    const addresses = transferEvents
    .map(curr => {
      return [curr.returnValues.from, curr.returnValues.to];
    })
    .reduce((acc, curr) => acc.concat(curr), [])
    .reduce((acc, curr) => {
      if (web3.utils.toBN(curr).isZero()) return acc;
      if (acc.indexOf(curr) < 0) acc.push(curr);
      return acc;
    }, []);

    return addresses

  }

  render() {
    return (
      <div>
       <TokensTemplate/>
      </div>
    );
  }
}

export default () => (
  <Web3Container
    contractJSON={MasterPOCContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <OwnedTokens web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);