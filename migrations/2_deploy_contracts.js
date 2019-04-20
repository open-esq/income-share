const MasterPOC = artifacts.require("MasterPOC");
const ProofClaim = artifacts.require("ProofClaim");
const IncomeAssignment = artifacts.require("IncomeAssignment");

module.exports = deployer => {
  
  deployer.deploy(MasterPOC);
  deployer.deploy(IncomeAssignment);
};

const deployAssignment = (deployer, pctAddress) =>
  new Promise((resolve, reject) => {
    resolve(deployer.deploy(IncomeAssignment, pctAddress));
  });
