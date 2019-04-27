import React from "react";
import { Container } from "semantic-ui-react";
import Web3Container from "../utils/Web3Container";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";

class Student extends React.Component {
  render() {
    return (
      <div>
        <Container style={{ marginTop: "7em" }}>
          Here's where the student sees their details and repays
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
