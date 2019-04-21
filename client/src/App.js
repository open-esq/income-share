import React from "react";
import { APIClient, Openlaw } from 'openlaw';
import getWeb3 from "./utils/getWeb3";
import IncomeAssignmentContract from "./contracts/IncomeAssignmentContract.json"
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

export default class extends React.Component {

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

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = web3.eth.getAccounts();
      
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = IncomeAssignmentContract.networks[networkId]
      const instance = new web3.eth.Contract(
        IncomeAssignmentContract.abi,
        deployedNetwork && deployedNetwork.address
      )

      this.setState({ web3, accounts, contract: instance })
    } catch {
      throw error
    }
  }

  render() {
    return (
      <>
        <h1>Welcome to React Parcel Micro App!</h1>
        <p>Hard to get more minimal than this React app.</p>
      </>
    );
  }
}
