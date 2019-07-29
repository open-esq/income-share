import React from "react";
import { Container, Loader, Tab } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import AgreementTemplate from "./AgreementTemplate";
import Web3Container from "../utils/Web3Container";
import MasterPOCContract from "../contracts/MasterPOC.json";
require("dotenv").config();

class Agreements extends React.Component {
  render() {
    const panes = [
      {
        menuItem: "Income Share Agreement",
        render: () => (
          <Tab.Pane>
            <AgreementTemplate
              key={1}
              templateName={process.env.ISA_TEMPLATE_NAME}
              title={"Income Share Agreement"}
              web3={this.props.web3}
              accounts={this.props.accounts}
              contract={this.props.contract}
            />
          </Tab.Pane>
        )
      },
      {
        menuItem: "Income Share Assignment Agreement",
        render: () => (
          <Tab.Pane>
            <AgreementTemplate
              key={2}
              templateName={process.env.ISAA_TEMPLATE_NAME}
              title={"Income Share Assignment Agreement"}
              web3={this.props.web3}
              accounts={this.props.accounts}
              contract={this.props.contract}
            />
          </Tab.Pane>
        )
      }
    ];
    return (
      <Container style={{ marginTop: "7em" }}>
        <Tab menu={{ borderless: true }} panes={panes} renderActiveOnly />
      </Container>
    );
  }
}

export default () => (
  <Web3Container
    contractJSON={MasterPOCContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <Agreements web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);
