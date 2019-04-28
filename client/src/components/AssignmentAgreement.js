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

const ISA_DATE = "ISA Date"
const COMPANY_NAME = "Company Name"
const STUDENT_NAME = "Student Name"
const TOKENIZED_INCOME_SHARE_ADDRESS = "Tokenized Income Share Address"
const NUMBER_OF_SHARES = "Number of Shares"
const EFFECTIVE_DATE = "Effective Date"
const NUMBER_OF_ASSIGNED_SHARES = "Number of Assigned Shares"
const PURCHASE_PRICE = "Purchase Price"
const SELLER_NAME = "Seller Name"
const SELLER_ADDRESS = "Seller Address"
const SELLER_ETHEREUM_ADDRESS = "Seller Ethereum Address"
const SELLER_SIGNATORY_EMAIL = "Seller Signatory Email"
const BUYER_NAME = "Buyer Name"
const BUYER_ADDRESS = "Buyer Address"
const BUYER_ETHEREUM_ADDRESS = "Buyer Ethereum Address"
const BUYER_SIGNATORY_EMAIL = "Buyer Signatory Email"

//create config
const openLawConfig = {
  server: process.env.URL,
  templateName: process.env.ASSIGNMENT_TEMPLATE_NAME,
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
    draftId: "",
    
    // State variables for preview component
    previewHTML: null
  };

  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;
    //create an instance of the API client with url as parameter
    apiClient
      .login(openLawConfig.userName, openLawConfig.password)
      .then(console.log);

    //Retrieve your OpenLaw template by name, use async/await
    const template = await apiClient.getTemplate(openLawConfig.templateName);
    console.log(template)

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
      case ISA_DATE:
        this.setState({isaDate: value})
        break;
      case COMPANY_NAME:
        this.setState({companyName: value})
        break;
      case STUDENT_NAME:
        this.setState({studentName: value})
        break;
      case TOKENIZED_INCOME_SHARE_ADDRESS:
        this.setState({tokenAddr: value})
        break;
      case NUMBER_OF_SHARES:
        this.setState({numShares: value})
        break;
      case EFFECTIVE_DATE:
        this.setState({effectiveDate: value})
        break;
      case NUMBER_OF_ASSIGNED_SHARES:
        this.setState({numAssignedShares: value})
        break;
      case PURCHASE_PRICE:
        this.setState({purchasePrice: value})
        break;
      case SELLER_NAME:
        this.setState({sellerName: value})
        break;
      case SELLER_ADDRESS:
        this.setState({sellerAddr: value})
        break;
      case SELLER_ETHEREUM_ADDRESS:
        this.setState({sellerEthAddr: value})
        break;
      case SELLER_SIGNATORY_EMAIL:
        this.setState({sellerEmail: value})
        break;
        case BUYER_NAME:
        this.setState({buyerName: value})
        break;
      case BUYER_ADDRESS:
        this.setState({buyerAddr: value})
        break;
      case BUYER_ETHEREUM_ADDRESS:
        this.setState({buyerEthAddr: value})
        break;
      case BUYER_SIGNATORY_EMAIL:
        this.setState({buyerEmail: value})
        break;
    }
    console.log("KEY:", key, "VALUE:", value);
  };
  setTemplatePreview = async () => {
    const {isaDate, companyName, studentName, tokenAddr, numShares, effectiveDate, numAssignedShares, purchasePrice, sellerName, sellerAddr, sellerEthAddr, sellerEmail, buyerName, buyerAddr, buyerEthAddr, buyerEmail, compiledTemplate} = this.state
    try {
      const params = {
        [ISA_DATE]: isaDate,
        [COMPANY_NAME]: companyName,
        [STUDENT_NAME]: studentName,
        [TOKENIZED_INCOME_SHARE_ADDRESS]: tokenAddr,
        [NUMBER_OF_SHARES]: numShares,
        [EFFECTIVE_DATE]: effectiveDate,
        [NUMBER_OF_ASSIGNED_SHARES]: numAssignedShares,
        [PURCHASE_PRICE]: purchasePrice,
        [SELLER_NAME]: sellerName,
        [SELLER_ADDRESS]: sellerAddr,
        [SELLER_ETHEREUM_ADDRESS]: sellerEthAddr,
        [SELLER_SIGNATORY_EMAIL]: sellerEmail,
        [BUYER_NAME]: buyerName,
        [BUYER_ADDRESS]: buyerAddr,
        [BUYER_ETHEREUM_ADDRESS]: buyerEthAddr,
        [BUYER_SIGNATORY_EMAIL]: buyerEmail
      }
      console.log(params)

      const executionResult = await Openlaw.execute(compiledTemplate.compiledTemplate, {}, params)
      const agreements = await Openlaw.getAgreements(executionResult.executionResult)
      const previewHTML = await Openlaw.renderForReview(agreements[0].agreement,{});

      this.setState({previewHTML})
    } catch (error) {
      throw error;
    }
  };

  render() {
    const { variables, parameters, executionResult, previewHTML} = this.state;
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
        <AgreementPreview previewHTML={previewHTML}/>
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
