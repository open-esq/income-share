import React from "react";
import { Container, Loader, Tab } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import AgreementTemplate from "./AgreementTemplate";
import { getTokenContracts } from "../utils/helpers";
require("dotenv").config();

export default class Agreements extends React.Component {
  render() {
    const panes = [
      {
        menuItem: "Income Share Agreement",
        render: () => (
          <Tab.Pane>
            <AgreementTemplate
              key={1}
              templateName={process.env.ISA_TEMPLATE_NAME}
              title={process.env.ISA_TEMPLATE_NAME}
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
              templateName={"INCOME SHARE ASSIGNMENT AGREEMENT"}
              title={"INCOME SHARE ASSIGNMENT AGREEMENT"}
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
