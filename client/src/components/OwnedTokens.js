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
import MasterPOCContract from "../contracts/MasterPOC.json";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
import pcTokenJSON from "../contracts/ProofClaim.json";
import Web3Container from "../utils/Web3Container";
import { getTokenContracts } from "../utils/helpers";

export default class OwnedTokens extends React.Component {
  state = { activeToken: null, activeKey: null };

  setActiveToken = (token, i) => {
    const activeToken = {
      address: Object.keys(token)[0],
      amountReceived: Object.values(token)[0].amountReceived
    };
    const activeKey = i;
    this.setState({ activeToken, activeKey });
  };

  createAssignment = async () => {
    const { activeToken } = this.state;
    const { web3, accounts } = this.props;
    const assignment = {
      contract: activeToken.address,
      seller: accounts[0],
      buyer: "0x4e7627E12Cf6a04d0AF3361a67D015bAa33EeAEE",
      price: web3.utils.toWei("20"),
      numTransferred: web3.utils.toWei("40")
    };

    const networkId = await web3.eth.net.getId();
    const deployedAddress =
      IncomeAssignmentContract.networks[networkId].address;
    const assignmentContract = new web3.eth.Contract(
      IncomeAssignmentContract.abi,
      deployedAddress
    );

    const tx = await assignmentContract.methods
      .recordAssignment(
        assignment.contract,
        assignment.seller,
        assignment.buyer,
        assignment.price,
        assignment.numTransferred
      )
      .send({ from: accounts[0], gas: 300000 });

    const returnedAssignment = await assignmentContract.methods
      .getAssignment(assignment.contract, 0)
      .call({ from: accounts[0], gas: 300000 });

    console.log(returnedAssignment);

    // const createdAssignment = tx.events.AssignmentExecuted.returnValues;
    // console.log(createdAssignment);
  };

  render() {
    const { activeToken, activeKey } = this.state;
    const { web3, ownedTokenBalances } = this.props;
    return (
      <div>
        <Grid>
          <Grid.Column width={10}>
            <Header as="h3">Your Owned Tokens</Header>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={5}>
                    Token Contract Address
                  </Table.HeaderCell>
                  <Table.HeaderCell width={3}>
                    Number of Tokens
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ownedTokenBalances.map((token, i) => {
                  if(token) return (
                    <Table.Row
                      style={activeKey == i ? { fontWeight: "bold" } : null}
                      key={i}
                    >
                      <Table.Cell>
                        <span
                          className="fake-link"
                          onClick={() => this.setActiveToken(token, i)}
                        >
                          {Object.keys(token)[0]}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{web3.utils.fromWei(Object.values(token)[0].balance)}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Grid.Column>
          <Grid.Column width={6}>
            <Header as="h3">Token Details</Header>
            {activeToken ? (
              <Segment>
                <Form size="large">
                  <span
                    style={{
                      display: "block",
                      paddingBottom: "5px",
                      fontSize: "13px",
                      fontWeight: "bold"
                    }}
                  >
                    {activeToken.address}
                  </span>
                  <Form.Field name="companyName" width={16}>
                    <label>Company Name</label>
                    <input disabled value="Lambda Inc." />
                  </Form.Field>

                  <Form.Field name="studentName" width={16}>
                    <label>Student Name</label>
                    <input disabled value="Josh Ma" />
                  </Form.Field>
                  <Form.Field name="ethPaid" width={16}>
                    <label>ETH Paid to You</label>
                    <input
                      disabled
                      value={web3.utils.fromWei(activeToken.amountReceived)}
                    />
                  </Form.Field>
                  <Button>Manage Pending Assignment</Button>
                </Form>
                Emulate OpenLaw Functions (TestRPC Only!)
                <Button onClick={this.createAssignment}>
                  {" "}
                  Create Assignment
                </Button>
              </Segment>
            ) : null}
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
