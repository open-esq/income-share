import React from 'react'
import getWeb3 from "@drizzle-utils/get-web3"
import getContractInstance from "@drizzle-utils/get-contract-instance"
import createDrizzleUtils from "@drizzle-utils/core"

export default class Web3Container extends React.Component {
  state = { web3: null, accounts: null, contract: null };

  async componentDidMount () {
    try {
      const web3 = await getWeb3()
      const drizzleUtils = await createDrizzleUtils({ web3 })
      const accounts = await drizzleUtils.getAccounts()
      const contractInstance = await getContractInstance({
        web3,
        artifact: this.props.contractJSON
      })
      this.setState({ web3, accounts, contractInstance })
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      console.log(error)
    }
  }
  render () {
    const { web3, accounts, contract } = this.state
    return web3 && accounts
      ? this.props.render({ web3, accounts, contract })
      : this.props.renderLoading()
  }
}