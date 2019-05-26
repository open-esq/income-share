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

class Assignments extends React.Component {

    render() {
        return (
            <div>these are my assignments</div>
        )
    }
}

export default () => (
    <Web3Container
      contractJSON={MasterPOCContract}
      renderLoading={() => <div>Loading</div>}
      render={({ web3, accounts, contract }) => (
        <Assignments web3={web3} accounts={accounts} contract={contract} />
      )}
    />
  );
  