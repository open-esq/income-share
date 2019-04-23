import React from "react";
import { APIClient, Openlaw } from "openlaw";
import { Container, Loader, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "openlaw-elements/dist/openlaw-elements.min.css";
import OpenLawForm from "openlaw-elements";
import Web3Container from "../utils/Web3Container";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
import AgreementPreview from "./AgreementPreview";
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

    // State variables for agreement
    isaDate: null,
    companyName: null,
    studentName: null,
    tokenAddr: null,
    numShares: null,
    effectiveDate: null,
    numAssignedhares: null,
    purchasePrice: null,
    sellerName: null,
    sellerAddr: null,
    sellerEthAddr: null,
    sellerEmail: null,
    buyerName: null,
    buyerAddr: null,
    buyerEthAddr: null,
    buyerEmail: null,
  
    // State variables for OpenLaw
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
    switch(key){
      case "ISA Date":
        this.setState({isaDate: value})
        break;
      case "Company Name":
        this.setState({companyName: value})
        break;
      case "Student Name":
        this.setState({studentName: value})
        break;
      case "Tokenized Income Share Address":
        this.setState({tokenAddr: value})
        break;
      case "Number of Shares":
        this.setState({numShares: value})
        break;
      case "Effective Date":
        this.setState({effectiveDate: value})
        break;
      case "Number of Assigned Shares":
        this.setState({numAssignedShares: value})
        break;
      case "Purchase Price":
        this.setState({purchasePrice: value})
        break;
      case "Seller Name":
        this.setState({sellerName: value})
        break;
      case "Seller Address":
        this.setState({sellerAddr: value})
        break;
      case "Seller Ethereum Address":
        this.setState({sellerEthAddr: value})
        break;
      case "Seller Signatory Email":
        this.setState({sellerEmail: value})
        break;
        case "Buyer Name":
        this.setState({buyerName: value})
        break;
      case "Buyer Address":
        this.setState({buyerAddr: value})
        break;
      case "Buyer Ethereum Address":
        this.setState({buyerEthAddr: value})
        break;
      case "Buyer Signatory Email":
        this.setState({buyerEmail: value})
        break;
    }
    console.log("KEY:", key, "VALUE:", value);
  };
  setTemplatePreview = async event => {};

  render() {
    const { variables, parameters, executionResult } = this.state;
    if (!executionResult) return <Loader active />;
    return (
      <Container text style={{ marginTop: "7em" }}>
        <h1>Openlaw Income Assignment Agreement</h1>
        <OpenLawForm
          apiClient={apiClient}
          executionResult={executionResult}
          parameters={parameters}
          onChangeFunction={this.onChange}
          openLaw={Openlaw}
          variables={variables}
        />
        <Button onClick={this.setTemplatePreview}>Preview</Button>
        <AgreementPreview />
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
