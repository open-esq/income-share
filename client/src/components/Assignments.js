import React from "react";
import {
  Grid,
  Table,
  Segment,
  Header,
  Form,
  Button,
  Accordion,
  Loader
} from "semantic-ui-react";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
import Web3Container from "../utils/Web3Container";

export default class Assignments extends React.Component {
  state = { allAssignments: null };
  componentDidMount = async () => {
    const { web3, ownedTokenBalances, accounts } = this.props;

    const networkId = await web3.eth.net.getId();
    const deployedAddress =
      IncomeAssignmentContract.networks[networkId].address;
    const assignmentContract = new web3.eth.Contract(
      IncomeAssignmentContract.abi,
      deployedAddress
    );

    console.log(assignmentContract);
    const myTokens = ownedTokenBalances.map(x => Object.keys(x)[0]);
    const assignmentByContract = myTokens.map(async token => {
      const tokenNumbers = await assignmentContract.methods
        .getAssignmentNoByAddress(token)
        .call({ from: accounts[0], gas: 300000 });
      console.log(tokenNumbers);

      const assignmentPromises = tokenNumbers.map(async tokenNo => {
        const assignment = await assignmentContract.methods
          .getAssignment(token, tokenNo)
          .call({ from: accounts[0], gas: 300000 });

        return assignment;
      });

      const assignments = await Promise.all(assignmentPromises);
      return { [token]: assignments };
    });

    const allAssignments = await Promise.all(assignmentByContract);

    this.setState({ allAssignments });
  };

  render() {
    const { allAssignments } = this.state;
    if (!allAssignments) return <Loader active />;
    return (
      <div>
        {allAssignments.map((token, i) => {
          console.log(token)
          return (
            <div>
              <Header>{Object.keys(token)[0]}</Header>
            <Table celled style={{marginBottom:"20px"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={2}>
                    ID
                  </Table.HeaderCell>
                  <Table.HeaderCell width={2}>
                    Buyer
                  </Table.HeaderCell>
                  <Table.HeaderCell width={2}>
                    Seller
                  </Table.HeaderCell>
                  <Table.HeaderCell width={2}>
                    Number Transferred
                  </Table.HeaderCell>
                  <Table.HeaderCell width={2}>
                    Price in ETH
                  </Table.HeaderCell>
                  <Table.HeaderCell width={2}>
                    Confirm
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Object.values(token)[0].map((assignment, i) => {
                  return (
                    <Table.Row key={i}>
                    <Table.Cell>{i}</Table.Cell>
                    <Table.Cell>{assignment.buyer}</Table.Cell>
                    <Table.Cell>{assignment.seller}</Table.Cell>
                    <Table.Cell>{assignment.numTransferred}</Table.Cell>
                    <Table.Cell>{assignment.price}</Table.Cell>
                    <Table.Cell>{assignment.confirmed.toString()}</Table.Cell>
                  </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
            </div>
          );
        })}
      </div>
    );
  }
}
