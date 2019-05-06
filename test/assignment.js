const { getWeb3, getContractInstance } = require("./helpers");
const web3 = getWeb3();
const getInstance = getContractInstance(web3);
const assignmentContract = getInstance("IncomeAssignment");
const proofClaim = getInstance("MasterPOC");
const pcTokenJSON = require("../build/contracts/ProofClaim.json");

contract("Testing contracts", function(accounts) {
  let pcTokenInstance;
  let pcTokenAddr;
  let addresses;
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
        .send({ from: assignment1.seller, gas: 3000000 });

      // Execute first assignment
      await assignmentContract.methods
        .executeAssignment(assignment1.contractAddress, 0)
        .send({ from: assignment1.seller, gas: 3000000 });

      // Approve second token transfer
      await pcTokenInstance.methods
        .approve(assignmentContract._address, assignment2.numTransferred)
        .send({ from: assignment2.seller, gas: 3000000 });

      // Execute second assignment
      await assignmentContract.methods
        .executeAssignment(assignment2.contractAddress, 1)
        .send({ from: assignment2.seller, gas: 3000000 });

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
    it("should get the addresses of all of the past holders of the token", async () => {
      const transferEvents = await pcTokenInstance.getPastEvents("Transfer", {
        fromBlock: 0,
        toBlock: "latest"
      });

      addresses = transferEvents
        .map(curr => {
          return [curr.returnValues.from, curr.returnValues.to];
        })
        .reduce((acc, curr) => acc.concat(curr), [])
        .reduce((acc, curr) => {
          if (web3.utils.toBN(curr).isZero()) return acc;
          if (acc.indexOf(curr) < 0) acc.push(curr);
          return acc;
        }, []);

      console.log("unique addresses:", addresses);
      expect(addresses).to.eql([accounts[0], accounts[1], accounts[2]]);
    });

    it("should distribute sent ETH according to token ownership", async () => {
      // Make contract payment
      const acct0EthBalanceBefore = await web3.eth.getBalance(accounts[0]);
      const acct1EthBalanceBefore = await web3.eth.getBalance(accounts[1]);
      const acct2EthBalanceBefore = await web3.eth.getBalance(accounts[2]);

      await pcTokenInstance.methods.disbursePayment(addresses).send({
        from: accounts[3],
        value: web3.utils.toWei("10"),
        gas: 3000000
      });

      const acct0EthBalance = await web3.eth.getBalance(accounts[0]);
      const acct1EthBalance = await web3.eth.getBalance(accounts[1]);
      const acct2EthBalance = await web3.eth.getBalance(accounts[2]);

      expect(parseInt(acct0EthBalance - acct0EthBalanceBefore)).to.equal(
        parseInt(web3.utils.toWei("5"))
      );
      expect(parseInt(acct1EthBalance - acct1EthBalanceBefore)).to.equal(
        parseInt(web3.utils.toWei("2.5"))
      );
      expect(parseInt(acct2EthBalance - acct2EthBalanceBefore)).to.equal(
        parseInt(web3.utils.toWei("2.5"))
      );
    });

    it("should show which tokens a certain address holds", async () => {
      const numTokens = await proofClaim.methods
        .getContractCount()
        .call({ from: accounts[0], gas: 300000 });

      const tokenContractPromise = [Array(numTokens)]
        .map((_x, i) => {
          return i;
        })
        .map(index =>
          proofClaim.methods
            .contracts(index)
            .call({ from: accounts[0], gas: 300000 })
        );

      // Gets all the token addresses created through MasterPOC
      const tokenContracts = await Promise.all(tokenContractPromise);
      console.log(tokenContracts)
      // Object which shows all the owners for each token: {address => address[]}
      const ownershipByTokenPromises = tokenContracts.map(async curr => {
        const uniqueAddresses = await getAddresesByToken(curr);
        
        return { [curr]: uniqueAddresses };
      });

      const ownershipByToken = await Promise.all(ownershipByTokenPromises)
      console.log(ownershipByToken);
      
      const ownedTokens = ownershipByToken.map(tokenOwnership => {
        const token = Object.keys(tokenOwnership)
        console.log(token)
        return tokenOwnership[token].includes(accounts[0]) ? token[0] : null
      })
      // Array of tokens owned by account[0]
      console.log("acct0 owned tokens:", ownedTokens)
    });
  });
});

getAddresesByToken = async tokenContractAddr => {
  instance = new web3.eth.Contract(pcTokenJSON.abi, tokenContractAddr);
  const transferEvents = await instance.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: "latest"
  });

  addresses = transferEvents
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
