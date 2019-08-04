import React from "react";
import { APIClient, Openlaw } from "openlaw";
import {
  Container,
  Loader,
  Button,
  Message,
  Progress
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "openlaw-elements/dist/openlaw-elements.min.css";
import bs58 from "bs58";
import OpenLawForm from "openlaw-elements";
import AgreementPreview from "./AgreementPreview";
import pcTokenJSON from "../contracts/ProofClaim.json";
import {
  getTokenContracts,
  getBytes32FromIpfsHash,
  getIpfsHashFromBytes32
} from "../utils/helpers";
import IPFS from "ipfs-http-client";
require("dotenv").config();
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

class AgreementTemplate extends React.Component {
  //initial state of variables for Assignment Template, and web3,etc
  state = {
    // Variables for OpenLaw API
    openLawConfig: null,
    templateName: null,

    // State variables for OpenLaw
    title: "",
    template: "",
    compiledTemplate: null,
    parameters: {},
    executionResult: null,
    variables: null,
    // State variables for preview component
    previewHTML: null,
    loading: false,
    ipfsLoading: false,
    success: false,
    progress: 0,
    progressMessage: ""
  };

  fileInputRef = React.createRef();
  componentDidMount = async () => {
    //create config
    const openLawConfig = {
      server: process.env.URL,
      templateName: this.props.templateName,
      userName: process.env.OPENLAW_USER,
      password: process.env.OPENLAW_PASSWORD
    };

    const apiClient = new APIClient(openLawConfig.server);

    console.log(openLawConfig.userName);
    //const { web3, accounts, contract } = this.props;
    //create an instance of the API client with url as parameter
    apiClient
      .login(openLawConfig.userName, openLawConfig.password)
      .then(console.log);

    //Retrieve your OpenLaw template by name, use async/await
    const template = await apiClient.getTemplate(openLawConfig.templateName);
    console.log(template);

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
      openLawConfig,
      apiClient,
      title,
      template,
      compiledTemplate,
      parameters,
      executionResult,
      variables
    });
  };

  onChange = (key, value) => {
    const { compiledTemplate } = this.state;
    const parameters = key
      ? {
          ...this.state.parameters,
          [key]: [key].includes("Email")
            ? JSON.stringify({ email: value })
            : value
        }
      : this.state.parameters;

    const { executionResult, errorMessage } = Openlaw.execute(
      compiledTemplate.compiledTemplate,
      {},
      parameters
    );
    const variables = Openlaw.getExecutedVariables(executionResult, {});
    this.setState({ parameters, variables, executionResult });
  };

  setTemplatePreview = async () => {
    const { parameters, compiledTemplate } = this.state;
    console.log(parameters);

    const executionResult = await Openlaw.execute(
      compiledTemplate.compiledTemplate,
      {},
      parameters
    );
    const agreements = await Openlaw.getAgreements(
      executionResult.executionResult
    );
    const previewHTML = await Openlaw.renderForReview(
      agreements[0].agreement,
      {}
    );
    await this.setState({ previewHTML });
    document.getElementById("preview").scrollIntoView({
      behavior: "smooth"
    });
  };

  buildOpenLawParamsObj = async template => {
    const { parameters } = this.state;
    // const parameters = {
    //   "Company Name": "Lambda, Inc.",
    //   Logo: "false",
    //   "Where is Company Organized?": "Alabama",
    //   "What type of Entity is Company?": "corporation",
    //   "Company EthAddress": "0x3C01aB0075682A30C8130933C3ED99458eC84dA9",
    //   "Who is Company Processing Agent?": "Open Esquire",
    //   "Company Signature Email": '{"email":"josh.ma91@gmail.com"}',
    //   "Student Name": "123",
    //   "Higher Education or Training Provided by Company": "Software",
    //   "Student Mailing Address":
    //     '{"placeId":"ChIJe7cPjg5ItokRwiuJRILpCs8","streetName":"Sunrise Valley Drive","streetNumber":"12345","city":"Reston","state":"Virginia","country":"United States","zipCode":"20191","formattedAddress":"12345 Sunrise Valley Dr, Reston, VA 20191, USA"}',
    //   "Student Signature Email": '{"email":"josh.ma91@gmail.com"}'
    // };

    const object = {
      templateId: template.id,
      title: template.title,
      text: template.content,
      creator: process.env.OPENLAW_ID,
      parameters,
      overriddenParagraphs: {},
      agreements: {},
      readonlyEmails: [],
      editEmails: [],
      draftId: ""
    };
    return object;
  };

  onSubmit = async () => {
    const { openLawConfig, apiClient, progress, progressMessage } = this.state;

    //login to api
    this.setState(
      {
        loading: true,
        progress: 20,
        progressMessage: "Uploading to OpenLaw..."
      },
      async () => {
        try {
          const { accounts, contract, web3 } = this.props;
          const token = await apiClient.login(
            openLawConfig.userName,
            openLawConfig.password
          );
          document.getElementById("progress").scrollIntoView({
            behavior: "smooth"
          });

          const OPENLAW_JWT = token.headers.openlaw_jwt;

          //add Open Law params to be uploaded
          const uploadParams = await this.buildOpenLawParamsObj(
            this.state.template
          );
          console.log("parmeters from user..", uploadParams.parameters);
          const contractId = await apiClient.uploadContract(uploadParams);
          console.log(contractId);

          await apiClient.sendContract([], [], contractId);

          await this.setState({
            progress: 40,
            progressMessage:
              "Contract Uploaded! Please check your e-mail to sign"
          });

          this.timer = setInterval(async () => {
            const contractStatus = await apiClient.loadContractStatus(
              contractId
            );

            const signed = Object.keys(contractStatus.signatures)
              .map(curr => contractStatus.signatures[curr].done)
              .every(status => status);

            signed
              ? this.setState({
                  progress: 60,
                  progressMessage: "Contract Signed! Creating your token..."
                })
              : null;

            const created = signed
              ? contractStatus.ethereumCalls[0].calls[0].status ===
                "the transaction has been added to the chain and successfully executed"
              : null;

            if (signed && created) {
              await this.setState({
                progress: 80,
                progressMessage: "Contract Signed! Uploading to IPFS..."
              });
              clearInterval(this.timer);
              this.timer = null;
              const pdfURL = process.env.URL + "/contract/pdf/" + contractId;

              console.log("PDF URL:", pdfURL);
              const res = await fetch(pdfURL, {
                method: "get",
                headers: new Headers({
                  OPENLAW_JWT
                })
              });

              const blob = await res.blob();
              const reader = new window.FileReader();
              reader.readAsArrayBuffer(blob);
              reader.onloadend = async () => {
                const buffer = await Buffer.from(reader.result);
                const ipfsHashArray = await ipfs.add(buffer);
                const ipfsHash = ipfsHashArray[0].hash;
                console.log("IPFS Hash: ", ipfsHash);

                const tokenContracts = await getTokenContracts(
                  accounts,
                  contract
                );
                const ownedTokens = await this.getOwnedTokens(tokenContracts);
                // Array of tokens owned by account[0]
                console.log(ownedTokens);
                const newToken = ownedTokens
                  .filter(x => x != null)
                  .slice(-1)[0];
                console.log("created token:", newToken);

                const instance = new web3.eth.Contract(
                  pcTokenJSON.abi,
                  newToken
                );

                console.log(instance);
                await instance.methods
                  .setIPFSHash(getBytes32FromIpfsHash(ipfsHash))
                  .send({ from: accounts[0], gas: 3000000 });

                const returnedIPFSBytes32 = await instance.methods
                  .getIPFSHash()
                  .call({ from: accounts[0], gas: 3000000 });
    
                const successMessage = (
                  <span>
                    Success! Contract uploaded to IPFS{" "}
                    <a
                      target="_"
                      href={`https://ipfs.infura.io/ipfs/${ipfsHash}`}
                    >
                      <b>here</b>
                    </a>
                  </span>
                );

                await this.setState({
                  loading: false,
                  success: true,
                  progress: 100,
                  progressMessage: successMessage
                });
              };
            }
          }, 1000);
        } catch (error) {
          await this.setState({
            progressMessage: "Uh oh, we've run into an error..."
          });
          console.log(error);
        }
      }
    );
  };

  getOwnedTokens = async tokenContracts => {
    const { accounts } = this.props;
    // Object which shows all the owners for each token: {address => address[]}
    const ownershipByTokenPromises = tokenContracts.map(async curr => {
      const uniqueAddresses = await this.getAddresesByToken(curr);
      return { [curr]: uniqueAddresses };
    });

    const ownershipByToken = await Promise.all(ownershipByTokenPromises);

    const ownedTokens = ownershipByToken.map(tokenOwnership => {
      const token = Object.keys(tokenOwnership);
      return tokenOwnership[token].includes(
        this.state.parameters["Company EthAddress"]
      )
        ? token[0]
        : null;
    });
    return ownedTokens;
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
    const {
      apiClient,
      variables,
      parameters,
      executionResult,
      previewHTML,
      loading,
      success,
      ipfsLoading,
      progress,
      progressMessage
    } = this.state;
    if (!executionResult) return <Loader active />;
    return (
      <Container text style={{ marginTop: "2em" }}>
        <h1>{this.props.title}</h1>
        <OpenLawForm
          apiClient={apiClient}
          executionResult={executionResult}
          parameters={parameters}
          onChangeFunction={this.onChange}
          openLaw={Openlaw}
          variables={variables}
        />
        <Container className="button-group">
          <Button onClick={this.setTemplatePreview}>Preview</Button>
          <Button primary loading={loading} onClick={this.onSubmit}>
            Submit
          </Button>
        </Container>

        <Progress
          style={
            progress
              ? { display: "block", margin: "1em 0 2.5em" }
              : { display: "none" }
          }
          percent={progress}
          indicating
          id="progress"
          progress
        >
          {progress != 100 ? "Please don't close or refresh this page" : null}
          <p>{progressMessage}</p>
        </Progress>

        <AgreementPreview id="preview" previewHTML={previewHTML} />
      </Container>
    );
  }
}

export default AgreementTemplate;
