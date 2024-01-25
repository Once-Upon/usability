import { ethers } from 'ethers';
import { AsyncUtils } from '../types';

function sortByValue(obj: Record<string, string>): [string, string][] {
  return Object.entries(obj).sort(([, aVal], [, bVal]) => parseInt(bVal) - parseInt(aVal));
}

export function decodeTx(abi: ethers.InterfaceAbi, input: string): ethers.TransactionDescription | undefined {
  try {
    const iface = new ethers.Interface(abi);
    const transactionDescriptor = iface.parseTransaction({
      data: input,
    });
    return transactionDescriptor;
  } catch (err) {
    return undefined;
  }
}

export function decodeEvent(
  abi: ethers.InterfaceAbi,
  topics: string[],
  data: string
): ethers.LogDescription | undefined {
  try {
    const iface = new ethers.Interface(abi);
    const logDescriptor = iface.parseLog({
      topics,
      data,
    });
    return logDescriptor;
  } catch (err) {
    return undefined;
  }
}

export async function decodeTransaction(
  address: string,
  input: string,
  abiUtils: AsyncUtils['abi']
): Promise<ethers.TransactionDescription | undefined | null> {
  // if input is nothing
  if (input === '0x' || !input) return null;

  let abi: ethers.InterfaceAbi;
  // check if contract is proxy, if yes, get implementation address
  const implementationAddress = await abiUtils.getProxyImplementations(address);
  if (implementationAddress?.length > 0) {
    // grab abis from proxy implementations
    const abiPromises = implementationAddress.map((addr) => abiUtils.get(addr));
    const abis = await Promise.all(abiPromises);
    const uniqueAbiSet = new Set(abis.flat().map((ele) => JSON.stringify(ele)));
    abi = Array.from(uniqueAbiSet).map((ele) => JSON.parse(ele) as string | ethers.Fragment | ethers.JsonFragment);
  } else {
    // fetch abi from address
    abi = await abiUtils.get(address);
  }

  if (abi) {
    // decode with abi
    try {
      const transactionDescriptor = decodeTx(abi, input);
      if (transactionDescriptor) {
        return transactionDescriptor;
      }
    } catch (e) {
      // ignore this for now
    }
  }

  // decode with hash
  const sigHash = input.slice(0, 10);
  const allMatchingFunctionVariants = await abiUtils.getHashMap(sigHash);
  if (Object.keys(allMatchingFunctionVariants).length === 0) {
    return undefined;
  }

  const sortedFunctions = sortByValue(allMatchingFunctionVariants);
  for (const functionHash of sortedFunctions) {
    try {
      const transactionDescriptor = decodeTx([`function ${functionHash[0]}`], input);
      // if its correct hash
      if (transactionDescriptor) {
        return transactionDescriptor;
      }
    } catch (e) {
      // ignore this for now
    }
  }

  return undefined;
}

export async function decodeLog(
  address: string,
  topics: string[],
  data: string,
  abiUtils: AsyncUtils['abi']
): Promise<ethers.LogDescription | undefined | null> {
  if (topics.length === 0) {
    return null;
  }
  let abi: ethers.InterfaceAbi;
  // check if contract is proxy, if yes, get implementation address
  const implementationAddress = await abiUtils.getProxyImplementations(address);
  if (implementationAddress?.length > 0) {
    // grab abis from proxy implementations
    const abiPromises = implementationAddress.map((addr) => abiUtils.get(addr));
    const abis = await Promise.all(abiPromises);
    const uniqueAbiSet = new Set(abis.flat().map((ele) => JSON.stringify(ele)));
    abi = Array.from(uniqueAbiSet).map((ele) => JSON.parse(ele) as string | ethers.Fragment | ethers.JsonFragment);
  } else {
    // fetch abi from address
    abi = await abiUtils.get(address);
  }
  if (abi) {
    // decode with abi
    try {
      const logDescriptor = decodeEvent(abi, topics, data);
      if (logDescriptor) {
        return logDescriptor;
      }
    } catch (e) {
      // ignore this for now
    }
  }

  // decode with hash
  const eventHash = topics[0];
  const eventSigResult = await abiUtils.getHashMap(eventHash);
  const eventSig = Object.keys(eventSigResult)[0];
  const allMatchingEventVariants = await abiUtils.getHashMap(eventSig);
  if (Object.keys(allMatchingEventVariants).length === 0) {
    return undefined;
  }

  const sortedEvents = sortByValue(allMatchingEventVariants);
  for (const event of sortedEvents) {
    try {
      const logDescriptor = decodeEvent([`event ${event[0]}`], topics, data);
      if (logDescriptor) {
        return logDescriptor;
      }
    } catch (e) {
      // ignore this for now
    }
  }

  return undefined;
}
