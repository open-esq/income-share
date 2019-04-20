const { getWeb3, getContractInstance } = require("./helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);
const assignmentContract = getInstance("IncomeAssignment");
const proofClaim = getInstance("MasterPOC");
const pcTokenJSON = require("../build/contracts/ProofClaim.json");

contract("Testing contracts", function(accounts) {
  let pcTokenInstance;
  let pcTokenAddr;
  describe("Testing ProofClaim contract", () => {
    
    const claim1 = {
      symbol: "PC1",
      name: "Proof Claim 1",
      owner: accounts[0]
    };

    it("should retrieve the proper number of created tokens", async () => {
      const tx = await proofClaim.methods
        .newProofClaim(claim1.symbol, claim1.name, claim1.owner)
        .send({ from: accounts[0], gas: 3000000 });

      pcTokenAddr =
        tx.events.newProofClaimContract.returnValues.contractAddress;
      console.log("PC token address:", pcTokenAddr);

      pcTokenInstance = new web3.eth.Contract(pcTokenJSON.abi, pcTokenAddr);

      const pcTokenBalance = await pcTokenInstance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0], gas: 3000000 });

      expect(parseInt(pcTokenBalance)).to.equal(100);
    });
  });

  describe("Testing IncomeAssignment contract", () => {
    
    it("should retrieve the proper assignment count", async () => {
   
    const assignment1 = {
      contractAddress: pcTokenAddr,
      assignor: accounts[0],
      assignee: accounts[1],
      price: 1 * 10 ** 18,
      numTransferred: 50
    };

    const assignment2 = {
      contractAddress: pcTokenAddr,
      assignor: accounts[1],
      assignee: accounts[2],
      price: 0.5 * 10 ** 18,
      numTransferred: 25
    };

      const initialNumAssignments = await assignmentContract.methods
        .getNumAssignments(pcTokenAddr)
        .call({ from: accounts[0], gas: 3000000 });

      await assignmentContract.methods
        .recordAssignment(
          assignment1.contractAddress,
          assignment1.assignor,
          assignment1.assignee,
          assignment1.price.toString(),
          assignment1.numTransferred
        )
        .send({ from: accounts[0], gas: 3000000 });

        await assignmentContract.methods
        .recordAssignment(
          assignment1.contractAddress,
          assignment1.assignor,
          assignment1.assignee,
          assignment1.price.toString(),
          assignment1.numTransferred
        )
        .send({ from: accounts[0], gas: 3000000 });

      const afterNumAssignments = await assignmentContract.methods
        .getNumAssignments(pcTokenAddr)
        .call({ from: accounts[0], gas: 3000000 });
      console.log("after", afterNumAssignments)
      expect(parseInt(initialNumAssignments)).to.equal(0);
      expect(parseInt(afterNumAssignments)).to.equal(1);
    });

    
  });
});
