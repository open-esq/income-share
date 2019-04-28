import React from "react";
import { APIClient, Openlaw } from "openlaw";
import { Container, Button, Form } from "semantic-ui-react";
import Web3Container from "../utils/Web3Container";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
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

  render() {
    console.log(process.env.URL);
    return (
      <div>
        <Container style={{ marginTop: "7em" }}>
          <p>Here's where the student sees their contract details and repays</p>
          <Form>
            <Form.Field>
              <label>Token Address</label>
              <input placeholder="Token Address e.g. 0xD5265358495C6744267BDbAA0C4a7eFcf8182a8F" />
            </Form.Field>
            <Form.Field>
              <label>Payment Amount in ETH</label>
              <input placeholder="Payment Amount" />
            </Form.Field>
            <Button type="submit">Submit</Button>
          </Form>
        </Container>
      </div>
    );
  }
}

export default () => (
  <Web3Container
    contractJSON={IncomeAssignmentContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <Student web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);
