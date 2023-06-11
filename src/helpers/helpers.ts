import { ethers } from 'ethers';
import { Provider } from 'zksync-web3';

async function getProvider(): Promise<Provider> {
  // zkSync api endpoint
  return new Provider('https://mainnet.era.zksync.io');
}

async function getWSProvider(): Promise<ethers.providers.WebSocketProvider> {
  return await new ethers.providers.WebSocketProvider('wss://mainnet.era.zksync.io/ws');
}

export { getProvider, getWSProvider };
