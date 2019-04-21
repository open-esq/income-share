const { getWeb3, getContractInstance } = require("./helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);
const assignmentContract = getInstance("IncomeAssignment");
const proofClaim = getInstance("MasterPOC");
const pcTokenJSON = require("../build/contracts/ProofClaim.json");

contract("Testing contracts", function(accounts) {
  let pcTokenInstance;
  let pcTokenAddr;
  let assignment1 = {
    seller: accounts[0],
    buyer: accounts[1],
    price: 1 * 10 ** 18,
    numTransferred: 50
  };

  let assignment2 = {
    seller: accounts[1],
    buyer: accounts[2],
    price: 0.5 * 10 ** 18,
    numTransferred: 25
  };

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

      assignment1.contractAddress = pcTokenAddr;
      assignment2.contractAddress = pcTokenAddr;

      pcTokenInstance = new web3.eth.Contract(pcTokenJSON.abi, pcTokenAddr);

      const pcTokenBalance = await pcTokenInstance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0], gas: 3000000 });

      expect(parseInt(pcTokenBalance)).to.equal(100);
    });
  });

  describe("Testing IncomeAssignment contract", () => {
    it("should retrieve the proper assignment count", async () => {
      const initialNumAssignments = await assignmentContract.methods
        .getNumAssignments(pcTokenAddr)
        .call({ from: accounts[0], gas: 3000000 });

      // First assignment
      await assignmentContract.methods
        .recordAssignment(
          assignment1.contractAddress,
          assignment1.seller,
          assignment1.buyer,
          assignment1.price.toString(),
          assignment1.numTransferred
        )
        .send({ from: accounts[0], gas: 3000000 });

      // Second assignment
      await assignmentContract.methods
        .recordAssignment(
          assignment2.contractAddress,
          assignment2.seller,
          assignment2.buyer,
          assignment2.price.toString(),
          assignment2.numTransferred
        )
        .send({ from: accounts[0], gas: 3000000 });

      const afterNumAssignments = await assignmentContract.methods
        .getNumAssignments(pcTokenAddr)
        .call({ from: accounts[0], gas: 3000000 });

      expect(parseInt(initialNumAssignments)).to.equal(0);
      expect(parseInt(afterNumAssignments)).to.equal(2);
    });

    it("should show that the assignment was executed", async () => {
      const acct0Balance = await pcTokenInstance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0], gas: 3000000 });

      console.log("acct0Balance:", acct0Balance);
      console.log("contractAddress:", assignment1.contractAddress);

      // Approve first token transfer
      await pcTokenInstance.methods
        .approve(assignmentContract._address, assignment1.numTransferred)
        .send({ from: accounts[0], gas: 3000000 });

      // Execute first assignment
      await assignmentContract.methods
        .executeAssignment(assignment1.contractAddress, 0)
        .send({ from: accounts[0], gas: 3000000 });

      // Approve second token transfer
      await pcTokenInstance.methods
        .approve(assignmentContract._address, assignment2.numTransferred)
        .send({ from: accounts[1], gas: 3000000 });

      // Execute second assignment
      await assignmentContract.methods
        .executeAssignment(assignment2.contractAddress, 1)
        .send({ from: accounts[1], gas: 3000000 });

      // Get first assignment details
      const retrievedAssignment1 = await assignmentContract.methods
        .getAssignment(pcTokenAddr, 0)
        .call({ from: accounts[0], gas: 3000000 });

      const retrievedAssignment2 = await assignmentContract.methods
        .getAssignment(pcTokenAddr, 1)
        .call({ from: accounts[0], gas: 3000000 });

      expect(retrievedAssignment1.confirmed).to.equal(true);
      expect(retrievedAssignment2.confirmed).to.equal(true);
    });

    it("should retrieve the proper token balances", async () => {
      const acct0Balance = await pcTokenInstance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0], gas: 3000000 });

      const acct1Balance = await pcTokenInstance.methods
        .balanceOf(accounts[1])
        .call({ from: accounts[0], gas: 3000000 });
      console.log("acct1Balance:", acct1Balance);

      const acct2Balance = await pcTokenInstance.methods
        .balanceOf(accounts[2])
        .call({ from: accounts[0], gas: 3000000 });

      expect(parseInt(acct0Balance)).to.equal(50);
      expect(parseInt(acct1Balance)).to.equal(25);
      expect(parseInt(acct2Balance)).to.equal(25);
    });
  });
});
