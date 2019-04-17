const { getWeb3, getContractInstance } = require("./helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);
const assignmentContract = getInstance("IncomeAssignment");
const pcTokenAddr = getInstance("ProofClaim").address;

contract("Testing MiraiCore contract", function(accounts) {
  const assignment1 = {
    contractAddress: pcTokenAddr,
    assignor: accounts[0],
    assignee: accounts[1],
    price: 1*10**18,
    numTransferred: 50
  };

  const assignment2 = {
    contractAddress: pcTokenAddr,
    assignor: accounts[1],
    assignee: accounts[2],
    price: 0.5*10**18,
    numTransferred: 25
  };


  it("should retrieve the product information", async () => {
    await assignmentContract.methods
      .recordAssignment(assignment1.contractAddress, assignment1.assignor, assignment1.assignee, assignment1.price, assignment1.numTransferred)
      .send({ from: accounts[0], gas: 3000000 });

    const numAssignments = await assignmentContract.methods.getNumAssignments(pcTokenAddr).call({ from: accounts[0], gas: 3000000 });

    expect(parseInt(numAssignments)).to.equal(1);   
  });
});