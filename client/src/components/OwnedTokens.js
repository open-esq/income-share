import React from "react";
import { Grid, Table, Segment, Header, Form, Button } from "semantic-ui-react";
import MasterPOCContract from "../contracts/MasterPOC.json";
import pcTokenJSON from "../contracts/ProofClaim.json";
import Web3Container from "../utils/Web3Container";

class OwnedTokens extends React.Component {
  state = { ownedTokenBalances: [] };
  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;

    const numTokens = await contract.methods
      .getContractCount()
      .call({ from: accounts[0], gas: 300000 });

    // Gets all the token addresses created through MasterPOC
    const tokenContractPromise = [...Array(parseInt(numTokens)).keys()].map(
      index =>
        contract.methods
          .contracts(index)
          .call({ from: accounts[0], gas: 300000 })
    );

    const tokenContracts = await Promise.all(tokenContractPromise);
    console.log(tokenContracts);
    // Object which shows all the owners for each token: {address => address[]}
    const ownershipByTokenPromises = tokenContracts.map(async curr => {
      const uniqueAddresses = await this.getAddresesByToken(curr);
      return { [curr]: uniqueAddresses };
    });

    const ownershipByToken = await Promise.all(ownershipByTokenPromises);
    console.log(ownershipByToken);

    const ownedTokens = ownershipByToken.map(tokenOwnership => {
      const token = Object.keys(tokenOwnership);
      console.log(token);
      return tokenOwnership[token].includes(accounts[0]) ? token[0] : null;
    });
    // Array of tokens owned by account[0]
    console.log("acct0 owned tokens:", ownedTokens);

    const ownedTokenBalancesPromises = ownedTokens.map(async tokenAddr => {
      const instance = new web3.eth.Contract(pcTokenJSON.abi, tokenAddr);
      const balance = await instance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0], gas: 3000000 });
        return {[tokenAddr]: balance}
    })

    const ownedTokenBalances = await Promise.all(ownedTokenBalancesPromises)
    console.log(ownedTokenBalances)
    this.setState({ ownedTokenBalances });
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

  render() {
    const { ownedTokenBalances } = this.state;
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
                {ownedTokenBalances.map(token => {
                  return (
                    <Table.Row>
                      <Table.Cell>
                        <a onClick={() => this.setState({ tokenIndex: 1 })}>
                          {Object.keys(token)[0]}
                        </a>
                      </Table.Cell>
                      <Table.Cell>{Object.values(token)}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Grid.Column>
          <Grid.Column width={6}>
            <Header as="h3">Token Details</Header>
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
                  0x04Bb2058E3cfC31721d50DceF96C576C761b38c0
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
                  <input disabled value="4.4" />
                </Form.Field>
                <Button>Manage Pending Assignment</Button>
              </Form>
            </Segment>
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
