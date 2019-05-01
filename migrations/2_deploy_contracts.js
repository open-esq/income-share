const MasterPOC = artifacts.require("MasterPOC");
const IncomeAssignment = artifacts.require("IncomeAssignment");

module.exports = deployer => {
  
  deployer.deploy(MasterPOC);
  deployer.deploy(IncomeAssignment);
};

const deployAssignment = (deployer, pctAddress) =>
  new Promise((resolve, reject) => {
    resolve(deployer.deploy(IncomeAssignment, pctAddress));
  });
