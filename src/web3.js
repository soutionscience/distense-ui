import contract from 'truffle-contract'
import { NETWORK } from './features/user/network'

export const selectContractInstance = contractBuild => {
  try {
    const web3 = window.web3 && window.web3.currentProvider
    // const correctNetwork = window.web3.version.network === NETWORK
    if (web3) {
      console.log(`getting contract instance for ${contractBuild.contractName}`)
      const myContract = contract(contractBuild)
      myContract.setProvider(window.web3.currentProvider)
      myContract.defaults({
        gas: 2e6
      })
      return myContract.deployed()
    }
  } catch (e) {
    console.error(e)
  }
}

export const PromisifyWeb3 = web3 => {
  const callbackToResolve = function(resolve, reject) {
    return function(error, value) {
      if (error) {
        reject(error)
      } else {
        resolve(value)
      }
    }
  }

  // List synchronous functions masquerading as values.
  const syncGetters = {
    db: [],
    eth: [
      'accounts',
      'blockNumber',
      'coinbase',
      'gasPrice',
      'hashrate',
      'mining',
      'protocolVersion',
      'syncing'
    ],
    net: ['listening', 'peerCount'],
    personal: ['listAccounts'],
    shh: [],
    version: ['ethereum', 'network', 'node', 'whisper']
  }

  Object.keys(syncGetters).forEach(function(group) {
    Object.keys(web3[group]).forEach(function(method) {
      if (syncGetters[group].indexOf(method) > -1) {
        // Skip
      } else if (typeof web3[group][method] === 'function') {
        web3[group][method + 'Promise'] = function() {
          const args = arguments
          return new Promise(function(resolve, reject) {
            args[args.length] = callbackToResolve(resolve, reject)
            args.length++
            web3[group][method].apply(web3[group], args)
          })
        }
      }
    })
  })
}
