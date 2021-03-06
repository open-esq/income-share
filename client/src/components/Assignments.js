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
import pcTokenJSON from "../contracts/ProofClaim.json";
import Web3Container from "../utils/Web3Container";

export default class Assignments extends React.Component {
  state = { allAssignments: null, assignmentContract: null };
  componentDidMount = async () => {
    const { web3, tokenContracts, accounts } = this.props;
    console.log(tokenContracts)
    const networkId = await web3.eth.net.getId();
    const deployedAddress =
      IncomeAssignmentContract.networks[networkId].address;
    const assignmentContract = new web3.eth.Contract(
      IncomeAssignmentContract.abi,
      deployedAddress
    );
    console.log("deployed address", deployedAddress)

    const assignmentByContract = tokenContracts.map(async token => {
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
      if (assignments.length > 0) return { [token]: assignments };
    });

    const allAssignments = await Promise.all(assignmentByContract);

    this.setState({ allAssignments, assignmentContract });
  };

  onConfirm = async (tokenAddr, assignmentNo) => {
    const { assignmentContract } = this.state;
    const { accounts, web3 } = this.props;

    const assignment = await assignmentContract.methods
      .getAssignment(tokenAddr, assignmentNo)
      .call({ from: accounts[0], gas: 300000 });

    const numTransferred = assignment.numTransferred;
    console.log("number transferred", numTransferred);

    const tokenContract = new web3.eth.Contract(pcTokenJSON.abi, tokenAddr);
    await tokenContract.methods
      .approve(assignmentContract._address, numTransferred)
      .send({ from: accounts[0], gas: 3000000 });

    await assignmentContract.methods
      .executeAssignment(tokenAddr, assignmentNo)
      .send({ from: accounts[0], gas: 300000 });

    const executedAssignment = await assignmentContract.methods
      .getAssignment(tokenAddr, assignmentNo)
      .call({ from: accounts[0], gas: 300000 });

    console.log(executedAssignment);
  };

  render() {
    const { allAssignments } = this.state;
    const { accounts, web3 } = this.props;
    if (!allAssignments) return <Loader active />;
    return (
      <div>
        {allAssignments.map((token, i) => {
          console.log(token);
          if (!token) return null;
          return (
            <div>
              <Header>{Object.keys(token)[0]}</Header>
              <Table celled style={{ marginBottom: "20px" }}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={2}>ID</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Buyer</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Seller</Table.HeaderCell>
                    <Table.HeaderCell width={2}>
                      Number Transferred
                    </Table.HeaderCell>
                    <Table.HeaderCell width={2}>Price in ETH</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Confirm</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.values(token)[0].map((assignment, i) => {
                    return (
                      <Table.Row key={i}>
                        <Table.Cell>{i}</Table.Cell>
                        <Table.Cell>{assignment.buyer}</Table.Cell>
                        <Table.Cell>{assignment.seller}</Table.Cell>
                        <Table.Cell>{web3.utils.fromWei(assignment.numTransferred)}</Table.Cell>
                        <Table.Cell>{web3.utils.fromWei(assignment.price)}</Table.Cell>
                        {assignment.confirmed ? (
                          <Table.Cell>&#10004;</Table.Cell>
                        ) : (
                          <Table.Cell>
                            {accounts[0] == assignment.seller ? (
                              <Button
                                onClick={() =>
                                  this.onConfirm(Object.keys(token)[0], i)
                                }
                              >
                                Confirm
                              </Button>
                            ) : (
                              <span style={{ fontWeight: "bold" }}>
                                Awaiting confirmation
                              </span>
                            )}
                          </Table.Cell>
                        )}
                      </Table.Row>
                    );
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
