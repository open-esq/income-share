import React from "react";
import {
  Grid,
  Table,
  Segment,
  Header,
  Form,
  Button,
  Accordion
} from "semantic-ui-react";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
import Web3Container from "../utils/Web3Container";

export default class Assignments extends React.Component {
  componentDidMount = async () => {
    const { web3, ownedTokenBalances, accounts } = this.props;

    const networkId = await web3.eth.net.getId();
    const deployedAddress =
      IncomeAssignmentContract.networks[networkId].address;
    const assignmentContract = new web3.eth.Contract(
      IncomeAssignmentContract.abi,
      deployedAddress
    );
 
    console.log(assignmentContract)
    const myTokens = ownedTokenBalances.map(x => Object.keys(x)[0]);
    const assignmentNosByContract = myTokens.map(async token => {
      const tokenNumbers = await assignmentContract.methods
        .getAssignmentNoByAddress(token)
        .call({ from: accounts[0], gas: 300000 });
      console.log(tokenNumbers)
    });
    // const tokenNumbers = contract.getAssignmentNoByAddress();
  };

  render() {
    return <div>these are my assignments</div>;
  }
}
