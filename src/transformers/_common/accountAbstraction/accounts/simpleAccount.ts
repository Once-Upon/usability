import { Hex } from 'viem';
import type { PseudoTransaction } from '../../../../types';
import { decodeTransactionInput } from '../utils';

// https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/contracts/samples/SimpleAccount.sol
const abi = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'uint8', name: 'operation', type: 'uint8' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'dest',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'func',
        type: 'bytes[]',
      },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const decode = (transaction: PseudoTransaction) => {
  const decoded = decodeTransactionInput(
    transaction.input as Hex,
    abi,
  );

  // const decoded = decodeTransactionInput(transaction.input as Hex, abi);

  if (decoded?.functionName === 'execute') {
    const [to, value, input] = decoded.args;

    return { to, value: value.toString() as Hex, input };
  } else if (decoded?.functionName === 'executeBatch') {
    if (decoded.args[0].length === 1) {
      const to = decoded.args[0][0];
      const value = decoded.args[0][0];
      const input = decoded.args[0][0];

      return { to, value: value, input };
    }

    // TODO support batches with more than 1 transaction
  }
};
