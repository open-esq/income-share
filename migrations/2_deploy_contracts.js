const MasterPOC = artifacts.require("MasterPOC");
const ProofClaim = artifacts.require("ProofClaim");
const IncomeAssignment = artifacts.require("IncomeAssignment");

module.exports = async deployer => {
  const accounts = await web3.eth.getAccounts();
  deployer.deploy(MasterPOC);
  await deployer
    .deploy(ProofClaim, "PCT", "Proof of Claim Token", accounts[0], 100)
  await deployer.deploy(IncomeAssignment, ProofClaim.address)
};

const deployAssignment = (deployer, pctAddress) =>
  new Promise((resolve, reject) => {
    resolve(deployer.deploy(IncomeAssignment, pctAddress));
  });
