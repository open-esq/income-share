export const getTokenContracts = async (accounts, contract) => {

  const numTokens = await contract.methods
  .getContractCount()
  .call({ from: accounts[0], gas: 300000 });

// Gets all the token addresses created through MasterPOC
const tokenContractPromise = [...Array(parseInt(numTokens)).keys()].map(
  index =>
    contract.methods
      .contracts(index)
      .call({ from: accounts[0], gas: 300000 })
);

const tokenContracts = await Promise.all(tokenContractPromise);
  return tokenContracts
};