import React from "react";
import { Grid, Table, Segment, Header, Form, Button } from "semantic-ui-react";
import MasterPOCContract from "../contracts/MasterPOC.json";
import pcTokenJSON from "../contracts/ProofClaim.json";
import Web3Container from "../utils/Web3Container";
import { getTokenContracts } from "../utils/helpers";

class OwnedTokens extends React.Component {
  state = { ownedTokenBalances: [], activeToken: null, activeKey: null };
  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;

    const tokenContracts = await getTokenContracts(accounts, contract);

    console.log(tokenContracts);

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

  render() {
    const { ownedTokenBalances, activeToken, activeKey } = this.state;
    const {web3} = this.props
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
                        <a href="#" onClick={() => this.setActiveToken(token, i)}>
                          {Object.keys(token)[0]}
                        </a>
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
                    activeToken.address
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
                    <input disabled value={web3.utils.fromWei(activeToken.amountReceived)} />
                  </Form.Field>
                  <Button>Manage Pending Assignment</Button>
                </Form>
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
