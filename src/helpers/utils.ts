import {
  ERC20_METHODS,
  ERC777_METHODS,
  ERC721_METHODS,
  ERC1155_METHODS,
  ERC165_METHODS,
  GOVERNOR_METHODS,
  SAFE_METHODS,
} from './constants';
import { RawBlock, StdObj } from '../types';

export const makeTransform = (
  children: Record<string, (transaction: any) => any>,
) => {
  return (transaction: any): any => {
    for (const childTransformer of Object.values(children)) {
      const result = childTransformer(transaction);
      if (result) {
        return result;
      }
    }
    return transaction;
  };
};

export function shortenTxHash(hash: string): string {
  if (hash.length <= 10) return hash;
  return hash.substr(0, 6) + hash.substr(-4);
}

// monkey-patch BigInt to serialize as JSON
// more context here: https://github.com/GoogleChromeLabs/jsbi/issues/30
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const bytecodeIsERC = (
  standard: Record<string, string>,
  bytecode: string,
): boolean => {
  const ercMethodsDetected = Object.keys(standard).filter(
    (key: string): boolean => bytecode.includes(standard[key]),
  );
  return ercMethodsDetected.length == Object.keys(standard).length;
};

export const bytecodeIsERC20 = (bytecode: string): boolean =>
  bytecodeIsERC(ERC20_METHODS, bytecode);
export const bytecodeIsERC777 = (bytecode: string): boolean =>
  bytecodeIsERC(ERC777_METHODS, bytecode);
export const bytecodeIsERC721 = (bytecode: string): boolean =>
  bytecodeIsERC(ERC721_METHODS, bytecode);
export const bytecodeIsERC1155 = (bytecode: string): boolean =>
  bytecodeIsERC(ERC1155_METHODS, bytecode);
export const bytecodeIsERC165 = (bytecode: string): boolean =>
  bytecodeIsERC(ERC165_METHODS, bytecode);
export const bytecodeIsIGovernor = (bytecode: string): boolean =>
  bytecodeIsERC(GOVERNOR_METHODS, bytecode);
export const bytecodeIsGnosisSafe = (bytecode: string): boolean =>
  bytecodeIsERC(SAFE_METHODS, bytecode);

export const normalizeBlock = (block: StdObj): RawBlock => {
  // console.log('block', block);

  let str = JSON.stringify(block);

  // replace all EVM addresses with lowercased versions
  str = str.replace(/("0x[A-z0-9]{40}")/g, (v) => v.toLowerCase());

  return JSON.parse(str) as RawBlock;
};

const VALID_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.? ';

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
  if (
    value !== null &&
    value !== undefined &&
    typeof value?.toString === 'function'
  ) {
    return value.toString();
  } else {
    // Return an empty string if the value is not convertible to a string.
    return '';
  }
};

export function splitStringIntoChunks(
  inputString: string,
  chunkSize: number,
): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < inputString.length; i += chunkSize) {
    chunks.push(inputString.slice(i, i + chunkSize));
  }
  return chunks;
}

export function objectToDotNotation(
  obj: Record<string, unknown>,
  current?: string,
) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const newObj = {};

  for (const key in obj) {
    const val = obj[key];
    const newKey = current ? `${current}.${key}` : key;
    if (val && typeof val === 'object') {
      Object.assign(
        newObj,
        objectToDotNotation(val as Record<string, unknown>, newKey),
      );
    } else {
      newObj[newKey] = val;
    }
  }

  return newObj;
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
