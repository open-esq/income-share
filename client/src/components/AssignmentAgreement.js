import React from "react";
import { APIClient, Openlaw } from "openlaw";
import { Container, Loader } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import OpenLawForm from "openlaw-elements";
import Web3Container from "../utils/Web3Container";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
require("dotenv").config();

//create config
const openLawConfig = {
  server: process.env.URL,
  templateName: process.env.TEMPLATE_NAME,
  userName: process.env.OPENLAW_USER,
  password: process.env.OPENLAW_PASSWORD
};

const apiClient = new APIClient(process.env.URL);

class AssignmentAgreement extends React.Component {
  //initial state of variables for Assignment Template, and web3,etc
  state = {
    date: "",
    companyName: "",
    studentName: "",
    tokenAddr: "",
    sellerEthAddr: "",
    buyerEthAddr: "",
    price: "",
    numTransferred: "",
    sellerAddr: "",
    buyerAddr: "",
    buyerEmail: "",
    sellerEmail: "",
    web3: null,
    accounts: null,
    contract: null,
    title: "",
    template: "",
    creatorId: "",
    compiledTemplate: null,
    parameters: {},
    executionResult: null,
    variables: null,
    draftId: ""
  };

  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;
    //create an instance of the API client with url as parameter

    apiClient
      .login(openLawConfig.userName, openLawConfig.password)
      .then(console.log);

    //Retrieve your OpenLaw template by name, use async/await
    const template = await apiClient.getTemplate(openLawConfig.templateName);

    //pull properties off of JSON and make into variables
    const title = template.title;
    //set title state
    this.setState({ title });

    //Retreive the OpenLaw Template, including MarkDown
    const content = template.content;
    console.log("template..", template);

    //Get the most recent version of the OpenLaw API Tutorial Template
    const versions = await apiClient.getTemplateVersions(
      openLawConfig.templateName,
      20,
      1
    );
    console.log("versions..", versions[0], versions.length);

    //Get the creatorID from the template.
    const creatorId = versions[0].creatorId;
    console.log("creatorId..", creatorId);

    //Get my compiled Template, for use in rendering the HTML in previewTemplate
    const compiledTemplate = await Openlaw.compileTemplate(content);
    if (compiledTemplate.isError) {
      throw "template error" + compiledTemplate.errorMessage;
    }
    console.log("my compiled template..", compiledTemplate);

    const parameters = {};
    const { executionResult, errorMessage } = await Openlaw.execute(
      compiledTemplate.compiledTemplate,
      {},
      parameters
    );

    console.log("execution result:", executionResult);

    // ** This is helpful for logging in development, or throwing exceptions at runtime.
    if (errorMessage) {
      console.error("Openlaw Execution Error:", errorMessage);
    }

    const variables = await Openlaw.getExecutedVariables(executionResult, {});
    console.log("variables:", variables);

    this.setState({
      title,
      template,
      creatorId,
      compiledTemplate,
      parameters,
      executionResult,
      variables
    });
  };

  onChange = (key, value) => {
    console.log("KEY:", key, "VALUE:", value);
  };
  previewTemplate = async event => {};

  render() {
    const { variables, parameters, executionResult } = this.state;
    if (!executionResult) return <Loader active />;
    return (
      <Container text style={{ marginTop: "7em" }}>
        <h1>Welcome to React Parcel Micro App!</h1>
        <p>Hard to get more minimal than this React app.</p>
        <OpenLawForm
          apiClient={apiClient}
          executionResult={executionResult}
          parameters={parameters}
          onChangeFunction={this.onChange}
          openLaw={Openlaw}
          variables={variables}
        />
      </Container>
    );
  }
}

export default () => (
  <Web3Container
    contractJSON={IncomeAssignmentContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <AssignmentAgreement
        web3={web3}
        accounts={accounts}
        contract={contract}
      />
    )}
  />
);
