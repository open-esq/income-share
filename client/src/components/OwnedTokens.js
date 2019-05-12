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
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json"
import pcTokenJSON from "../contracts/ProofClaim.json";
import Web3Container from "../utils/Web3Container";
import { getTokenContracts } from "../utils/helpers";

class OwnedTokens extends React.Component {
  state = { ownedTokenBalances: [], activeToken: null, activeKey: null };
  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;

    const tokenContracts = await getTokenContracts(accounts, contract);

    console.log("token contracts", tokenContracts);

    const ownedTokens = await this.getOwnedTokens(tokenContracts);
    // Array of tokens owned by account[0]
    console.log("acct0 owned tokens:", ownedTokens);

    const ownedTokenBalances = await this.getOwnedTokenBalances(ownedTokens);

    console.log("owned token balances:", ownedTokenBalances);
    this.setState({ ownedTokenBalances });
  };

  getOwnedTokenBalances = async ownedTokens => {
    const { web3, accounts } = this.props;
    const ownedTokenBalancesPromises = ownedTokens.map(async tokenAddr => {
      const instance = new web3.eth.Contract(pcTokenJSON.abi, tokenAddr);
      const balance = await instance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0], gas: 3000000 });

      const amountReceived = await instance.methods
        .getAmountPaid(accounts[0])
        .call({ from: accounts[0], gas: 300000 });
      console.log("amount received", amountReceived);
      return { [tokenAddr]: { balance, amountReceived } };
    });

    const ownedTokenBalances = await Promise.all(ownedTokenBalancesPromises);
    return ownedTokenBalances;
  };

  getOwnedTokens = async tokenContracts => {
    const { accounts } = this.props;
    // Object which shows all the owners for each token: {address => address[]}
    const ownershipByTokenPromises = tokenContracts.map(async curr => {
      const uniqueAddresses = await this.getAddresesByToken(curr);
      return { [curr]: uniqueAddresses };
    });

    const ownershipByToken = await Promise.all(ownershipByTokenPromises);

    const ownedTokens = ownershipByToken.map(tokenOwnership => {
      const token = Object.keys(tokenOwnership);
      return tokenOwnership[token].includes(accounts[0]) ? token[0] : null;
    });
    return ownedTokens;
  };

  getAddresesByToken = async tokenAddr => {
    const { web3 } = this.props;
    const instance = new web3.eth.Contract(pcTokenJSON.abi, tokenAddr);
    const transferEvents = await instance.getPastEvents("Transfer", {
      fromBlock: 0,
      toBlock: "latest"
    });

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

    return addresses;
  };

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
      seller: "0x5fD256B07691629B4d2Ce4336dc8f01E5BB8Ae8D",
      buyer: "0x4e7627E12Cf6a04d0AF3361a67D015bAa33EeAEE",
      price: 20,
      numTransferred: 40
    };

    const networkId = await web3.eth.net.getId();
    const deployedAddress = IncomeAssignmentContract.networks[networkId].address;  
    const assignmentContract = new web3.eth.Contract(IncomeAssignmentContract.abi, deployedAddress)

    const tx = await assignmentContract.methods
      .recordAssignment(
        assignment.contract,
        assignment.seller,
        assignment.buyer,
        assignment.price,
        assignment.numTransferred
      )
      .send({ from: accounts[0], gas: 300000 });

    const createdAssignment = tx.events.AssignmentExecuted.returnValues;
    console.log(createdAssignment);
  };

  render() {
    const { ownedTokenBalances, activeToken, activeKey } = this.state;
    const { web3 } = this.props;
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
                  return (
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
                      <Table.Cell>{Object.values(token)[0].balance}</Table.Cell>
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

export default () => (
  <Web3Container
    contractJSON={MasterPOCContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <OwnedTokens web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);
