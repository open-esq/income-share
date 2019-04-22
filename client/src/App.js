import React from "react";
import { APIClient, Openlaw } from 'openlaw';
import {Container} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Web3Container from "./utils/Web3Container";
import IncomeAssignmentContract from "./contracts/IncomeAssignment.json"
import FixedMenu from "./components/FixedMenu"
require('dotenv').config()

//create config
const openLawConfig = {
  server: process.env.URL,
  templateName: process.env.TEMPLATE_NAME,
  userName: process.env.OPENLAW_USER,
  password: process.env.OPENLAW_PASSWORD
};

//create an instance of the API client with url as parameter
const apiClient = new APIClient(URL);

class App extends React.Component {

  //initial state of variables for Assignment Template, and web3,etc
  state = { 

    date:'',
    companyName: '',
    studentName:'',
    tokenAddr:'',
    sellerEthAddr: '', 
    buyerEthAddr: '',
    price: '', 
    numTransferred: '',
    sellerAddr:'',
    buyerAddr:'',
    buyerEmail:'',
    sellerEmail:'',
    web3: null, 
    accounts: null, 
    contract: null,
    myTemplate: null, 
    myContent: null,
    creatorId:'',
    myCompiledTemplate: null, 
    draftId:''  
};

  render() {
    return (
      <div>
        <FixedMenu/>
        <Container text style={{ marginTop: "7em" }}>
        <h1>Welcome to React Parcel Micro App!</h1>
        <p>Hard to get more minimal than this React app.</p>
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
      <App web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);

