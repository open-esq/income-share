const MasterPOC = artifacts.require("MasterPOC");
const ProofClaim = artifacts.require("ProofClaim");
const IncomeAssignment = artifacts.require("IncomeAssignment");

module.exports = async (deployer) => {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts)
  deployer.deploy(MasterPOC);
  deployer
    .deploy(ProofClaim, "PCT", "Proof of Claim Token", accounts[0], 100)
    .then(pct => {
      console.log(pct.address);
      return deployAssignment(deployer, pct.address).then(x => {
        Promise.resolve();
      });
    });
};

const deployAssignment = (deployer, pctAddress) =>
  new Promise((resolve, reject) => {
    resolve(deployer.deploy(IncomeAssignment, pctAddress));
  });
