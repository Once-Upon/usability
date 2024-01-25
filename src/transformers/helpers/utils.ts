/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { EVM } from 'evm';

import {
  ERC20_METHODS,
  ERC777_METHODS,
  ERC721_METHODS,
  ERC1155_METHODS,
  ERC165_METHODS,
  GOVERNOR_METHODS,
  SAFE_METHODS,
  PROXY_IMPLEMENTATION_METHODS,
} from './constants';
import { AsyncUtils, RawBlock, StdObj, TransactionDescription } from '../types';

// this configuration helps us handle wei -> integer -> string conversions being in scientific notation
// (we don't want scientific notation)
BigNumber.config({ EXPONENTIAL_AT: 1000 });

// monkey-patch BigInt to serialize as JSON
// more context here: https://github.com/GoogleChromeLabs/jsbi/issues/30
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const toBigNumber = (v: unknown) => new BigNumber(v as string);

export const bytecodeIsERC = (standard: Record<string, string>, bytecode: string): boolean => {
  const ercMethodsDetected = Object.keys(standard).filter((key: string): boolean => bytecode.includes(standard[key]));
  return ercMethodsDetected.length == Object.keys(standard).length;
};

export const bytecodeIsERC20 = (bytecode: string): boolean => bytecodeIsERC(ERC20_METHODS, bytecode);
export const bytecodeIsERC777 = (bytecode: string): boolean => bytecodeIsERC(ERC777_METHODS, bytecode);
export const bytecodeIsERC721 = (bytecode: string): boolean => bytecodeIsERC(ERC721_METHODS, bytecode);
export const bytecodeIsERC1155 = (bytecode: string): boolean => bytecodeIsERC(ERC1155_METHODS, bytecode);
export const bytecodeIsERC165 = (bytecode: string): boolean => bytecodeIsERC(ERC165_METHODS, bytecode);
export const bytecodeIsIGovernor = (bytecode: string): boolean => bytecodeIsERC(GOVERNOR_METHODS, bytecode);
export const bytecodeIsGnosisSafe = (bytecode: string): boolean => bytecodeIsERC(SAFE_METHODS, bytecode);

export const normalizeBlock = (block: StdObj): RawBlock => {
  // console.log('block', block);

  let str = JSON.stringify(block);

  // replace all EVM addresses with lowercased versions
  str = str.replace(/("0x[A-z0-9]{40}")/g, (v) => v.toLowerCase());

  return JSON.parse(str) as RawBlock;
};

export function decodeEVMAddress(addressString: string): string {
  if (!addressString) return '';

  const buf = Buffer.from(addressString.replace(/^0x/, ''), 'hex');
  if (!buf.slice(0, 12).equals(Buffer.alloc(12, 0))) {
    return '';
  }
  const address = '0x' + buf.toString('hex', 12, 32); // grab the last 20 bytes
  return address.toLocaleLowerCase();
}

export const hexToString = (str: string) => {
  const buf = Buffer.from(str, 'hex');
  return buf.toString('utf8');
};

const VALID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.? ';

export const countValidChars = (stringToCount: string) => {
  let count = 0;
  for (let i = 0; i < stringToCount.length; i++) {
    if (VALID_CHARS.indexOf(stringToCount[i]) >= 0) {
      count++;
    }
  }
  return count;
};

export const convertToString = (value: any): string => {
  // Check if the value is not null or undefined, and it has a toString() method.
  if (value !== null && value !== undefined && typeof value?.toString === 'function') {
    return value.toString();
  } else {
    // Return an empty string if the value is not convertible to a string.
    return '';
  }
};

export function splitStringIntoChunks(inputString: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < inputString.length; i += chunkSize) {
    chunks.push(inputString.slice(i, i + chunkSize));
  }
  return chunks;
}

export function convertBNToStringInTx(decodeResult: ethers.TransactionDescription): TransactionDescription {
  let txDecode;
  if (decodeResult) {
    try {
      txDecode = {
        ...decodeResult,
        value: decodeResult.value.toString(),
        fragment: {
          ...decodeResult.fragment,
          gas: decodeResult.fragment.gas ? decodeResult.fragment.gas.toString() : null,
        },
        args: decodeResult.args.map((arg) => convertToString(arg)),
      };
    } catch (e) {
      // ignore deferred ethers error
    }
  }

  return txDecode;
}

export function objectToDotNotation(obj: Record<string, unknown>, current?: string) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const newObj = {};

  for (const key in obj) {
    const val = obj[key];
    const newKey = current ? `${current}.${key}` : key;
    if (val && typeof val === 'object') {
      Object.assign(newObj, objectToDotNotation(val as Record<string, unknown>, newKey));
    } else {
      newObj[newKey] = val;
    }
  }

  return newObj;
}
/**
 * Detect custom proxy and its implementation.
 * @param address The Ethereum address to check.
 * @param web3Provider The provider for web3 interactions.
 * @returns The target address if found, otherwise an empty string.
 */
export async function detectCustomProxy(address: string, web3Provider: AsyncUtils['web3Provider']): Promise<string> {
  // Retrieve the bytecode of the given address
  const code = await web3Provider.getCode(address);
  const evm = new EVM(code);
  const opcodes = evm.getOpcodes();

  // Check if bytecode contains DELEGATECALL
  const hasDelegateCall = opcodes.some((opcode) => opcode.name === 'DELEGATECALL');

  // Retrieve potential proxy implementations
  const implementations: string[] = await Promise.all(
    Object.values(PROXY_IMPLEMENTATION_METHODS).map(async (method) => {
      try {
        return await web3Provider.send('eth_call', [
          {
            to: address,
            data: `0x${method}`,
          },
        ]);
      } catch (error) {
        return '';
      }
    })
  );

  // Search for a valid implementation address
  const target =
    implementations
      .map((implementation) => decodeEVMAddress(implementation))
      .find((implementation) => implementation && ethers.isAddress(implementation)) || '';

  return hasDelegateCall && target ? target : '';
}

export const getTokenName = async (token): Promise<string> => {
  try {
    return (await token.methods.name().call()) as string;
  } catch (error) {
    console.log(`Name method not implemented.`);
    return '';
  }
};

export const getTokenSymbol = async (token): Promise<string> => {
  try {
    return (await token.methods.symbol().call()) as string;
  } catch (error) {
    console.log('Symbol method not implemented.');
    return '';
  }
};

export const getTokenDecimals = async (token): Promise<number> => {
  try {
    return (await token.methods.decimals().call()) as number;
  } catch (error) {
    console.log('Decimals method not implemented.');
    return 18;
  }
};
