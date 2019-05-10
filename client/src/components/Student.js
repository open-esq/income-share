import React from "react";
import { APIClient, Openlaw } from "openlaw";
import { Container, Button, Form, Header, Segment } from "semantic-ui-react";
import Web3Container from "../utils/Web3Container";
import MasterPOCContract from "../contracts/MasterPOC.json";
import pcTokenJSON from "../contracts/ProofClaim.json";
require("dotenv").config();

//create config
const openLawConfig = {
  server: process.env.URL,
  templateName: process.env.ASSIGNMENT_TEMPLATE_NAME,
  userName: process.env.OPENLAW_USER,
  password: process.env.OPENLAW_PASSWORD
};

const apiClient = new APIClient(process.env.URL);

class Student extends React.Component {
  state = { tokenAddress: "", paymentAmount: "", paymentLoading: false };

  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;
    apiClient
      .login(openLawConfig.userName, openLawConfig.password)
      .then(console.log);

    const olContract = await apiClient.getContract(
      "f35a7b2c9b8b2a430ee7bf1d9f840efd6379a0e99eb706fe976816f3726f8955"
    );
    console.log(olContract);
  };

  setTokenAddress = e => this.setState({ tokenAddress: e.target.value });

  setPaymentAmount = e => this.setState({ paymentAmount: e.target.value });

  makePayment = async () => {
    const {tokenAddress, paymentAmount} = this.state
    console.log("making payment")
    this.setState({paymentLoading: true}, async () => {
      const { web3, accounts, contract } = this.props;
      const tokenInstance = new web3.eth.Contract(pcTokenJSON.abi, tokenAddress);

      const transferEvents = await tokenInstance.getPastEvents("Transfer", {
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

      console.log("unique addresses owning token:", addresses);
      await tokenInstance.methods.disbursePayment(addresses).send({
        from: accounts[0],
        value: web3.utils.toWei(paymentAmount),
        gas: 3000000
      });

      this.setState({
        paymentLoading: false
      });
    })
  };

  initializeISA = async () => {
    const { web3, accounts, contract } = this.props;
    console.log(contract.methods);

    const claim = {
      symbol: "PC1",
      name: "Proof Claim 1",
      owner: accounts[0]
    };

    const tx = await contract.methods
      .newProofClaim(claim.symbol, claim.name, claim.owner)
      .send({ from: accounts[0], gas: 3000000 });

    const pcTokenAddr =
      tx.events.newProofClaimContract.returnValues.contractAddress;
    console.log("PC token address:", pcTokenAddr);
  };

  render() {
    const { tokenAddress, paymentAmount, paymentLoading } = this.state;
    return (
      <div>
        <Container style={{ marginTop: "7em" }}>
          <p>Here's where the student sees their contract details and repays</p>
          <Form>
            <Form.Field>
              <label>Token Address</label>
              <input
                placeholder="Token Address e.g. 0xD5265358495C6744267BDbAA0C4a7eFcf8182a8F"
                onChange={this.setTokenAddress}
                value={tokenAddress}
              />
            </Form.Field>
            <Form.Field>
              <label>Payment Amount in ETH</label>
              <input
                placeholder="Payment Amount"
                onChange={this.setPaymentAmount}
                value={paymentAmount}
              />
            </Form.Field>
            <Button type="submit" onClick={this.makePayment} loading={paymentLoading}>
              Make Payment
            </Button>
          </Form>

          <Header as="h4" attached="top" block>
            Emulate OpenLaw Functions (TestRPC Only!)
          </Header>
          <Segment attached>
            <Button onClick={this.initializeISA}>Initialize ISA</Button>
          </Segment>
        </Container>
      </div>
    );
  }
}

export default () => (
  <Web3Container
    contractJSON={MasterPOCContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <Student web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);
