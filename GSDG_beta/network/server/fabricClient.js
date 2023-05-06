const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = '/usr/src/your_connection_profile.json'; // Replace with the path to your connection profile
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function getNetwork() {
  const walletPath = path.join(process.cwd(), 'wallet'); // Replace with the path to your wallet
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identityName = 'your_identity_name'; // Replace with the name of the identity you enrolled

  if (!await wallet.get(identityName)) {
    throw new Error(`Identity ${identityName} not found in the wallet`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: identityName, discovery: { enabled: true, asLocalhost: true } });

  return await gateway.getNetwork('your_channel_name'); // Replace with the name of your channel
}

async function queryDataFromWriteChain(id) {
    const network = await getNetwork();
    const contract = network.getContract('write_chain'); // Replace with the name of your WriteChain chaincode
  
    const result = await contract.evaluateTransaction('GetData', id);
    return JSON.parse(result.toString());
  }
  
  async function queryPointerFromReadChain(id) {
    const network = await getNetwork();
    const contract = network.getContract('read_chain'); // Replace with the name of your ReadChain chaincode
  
    const result = await contract.evaluateTransaction('GetPointer', id);
    return JSON.parse(result.toString());
  }
  
// ...
async function writeDataToWriteChain(id, data) {
    const network = await getNetwork();
    const contract = network.getContract('write_chain'); // Replace with the name of your WriteChain chaincode
  
    const result = await contract.submitTransaction('WriteData', id, data);
    return JSON.parse(result.toString());
  }
  
  async function writePointerToReadChain(id, pointer) {
    const network = await getNetwork();
    const contract = network.getContract('read_chain'); // Replace with the name of your ReadChain chaincode
  
    const result = await contract.submitTransaction('WritePointer', id, pointer);
    return JSON.parse(result.toString());
  }
  
  module.exports = {
    queryDataFromWriteChain,
    queryPointerFromReadChain,
    writeDataToWriteChain,
    writePointerToReadChain,
  };
  
  