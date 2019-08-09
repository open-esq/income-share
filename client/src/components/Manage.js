import React from "react";
import { Container, Loader, Tab } from "semantic-ui-react";
import { APIClient, Openlaw } from "openlaw";
import "semantic-ui-css/semantic.min.css";
import Web3Container from "../utils/Web3Container";
import MasterPOCContract from "../contracts/MasterPOC.json";
import IncomeAssignmentContract from "../contracts/IncomeAssignment.json";
import pcTokenJSON from "../contracts/ProofClaim.json";
import OwnedTokens from "./OwnedTokens";
import Assignments from "./Assignments";
import { getTokenContracts, getIpfsHashFromBytes32 } from "../utils/helpers";

class Manage extends React.Component {
  state = { ownedTokenBalances: [], tokenContracts: [] };

  componentDidMount = async () => {
    const { web3, accounts, contract } = this.props;

    const openLawConfig = {
      server: process.env.URL,
      userName: process.env.OPENLAW_USER,
      password: process.env.OPENLAW_PASSWORD
    };

    const apiClient = new APIClient(openLawConfig.server);

    apiClient
      .login(openLawConfig.userName, openLawConfig.password)
      .then(console.log);

    console.log(contract);
    const tokenContracts = await getTokenContracts(accounts, contract);

    console.log("token contracts", tokenContracts);

    const ownedTokens = await this.getOwnedTokens(tokenContracts);
    // Array of tokens owned by account[0]
    console.log("acct0 owned tokens:", ownedTokens);

    const ownedTokenBalances = await this.getOwnedTokenBalances(ownedTokens, apiClient);

    console.log("owned token balances:", ownedTokenBalances);
    this.setState({ ownedTokenBalances, tokenContracts });
  };

  getOwnedTokenBalances = async (ownedTokens, apiClient) => {
    const { web3, accounts } = this.props;
    const ownedTokenBalancesPromises = ownedTokens.map(async tokenAddr => {
      if (tokenAddr) {
        const instance = new web3.eth.Contract(pcTokenJSON.abi, tokenAddr);
        const balance = await instance.methods
          .balanceOf(accounts[0])
          .call({ from: accounts[0], gas: 3000000 });

        const amountReceived = await instance.methods
          .getAmountPaid(accounts[0])
          .call({ from: accounts[0], gas: 300000 });
        console.log("amount received", amountReceived);

        const ipfsBytes32 = await instance.methods
          .getIPFSHash()
          .call({ from: accounts[0], gas: 300000 });

        const olContractID = await instance.methods
          .getContractID()
          .call({ from: accounts[0], gas: 300000 });

        const {parameters} = await apiClient.getContract(olContractID)
        console.log(parameters)

        const ipfsHash = getIpfsHashFromBytes32(ipfsBytes32);

        return {
          [tokenAddr]: { balance, amountReceived, ipfsHash, parameters }
        };
      }
    });

    const ownedTokenBalances = await Promise.all(ownedTokenBalancesPromises);
    return ownedTokenBalances;
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
      return tokenOwnership[token].includes(accounts[0]) ? token[0] : null;
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
    const { web3, accounts } = this.props;
    const { ownedTokenBalances, tokenContracts } = this.state;
    const panes = [
      {
        menuItem: "Owned Tokens",
        render: () => (
          <Tab.Pane>
            <OwnedTokens
              ownedTokenBalances={ownedTokenBalances}
              web3={web3}
              accounts={accounts}
            />
          </Tab.Pane>
        )
      },
      {
        menuItem: "Assignments",
        render: () => (
          <Tab.Pane>
            <Assignments
              ownedTokenBalances={ownedTokenBalances}
              tokenContracts={tokenContracts}
              web3={web3}
              accounts={accounts}
            />
          </Tab.Pane>
        )
      }
    ];
    if (!this.state.ownedTokenBalances) return null;
    return (
      <Container style={{ marginTop: "7em" }}>
        <Tab menu={{ borderless: true }} panes={panes} />
      </Container>
    );
  }
}

export default () => (
  <Web3Container
    contractJSON={MasterPOCContract}
    renderLoading={() => <div>Loading</div>}
    render={({ web3, accounts, contract }) => (
      <Manage web3={web3} accounts={accounts} contract={contract} />
    )}
  />
);
