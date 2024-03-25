import {
  Abi,
  decodeFunctionData,
  encodeAbiParameters,
  Hex,
  keccak256,
} from 'viem';
import { ENTRY_POINT } from './constants';
import type { UserOp } from './types';

export const decodeTransactionInput = <TAbi extends Abi>(
  input: Hex,
  abi: TAbi,
) => {
  try {
    const result = decodeFunctionData({
      abi,
      data: input,
    });

    return result;
  } catch (err) {
    return null;
  }
};

export const getUserOpHash = (userOp: UserOp, chainId: Hex) => {
  const packed = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'uint256' },
      { type: 'bytes32' },
      { type: 'bytes32' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'bytes32' },
    ],
    [
      userOp.sender,
      userOp.nonce,
      keccak256(userOp.initCode),
      keccak256(userOp.callData),
      userOp.callGasLimit,
      userOp.verificationGasLimit,
      userOp.preVerificationGas,
      userOp.maxFeePerGas,
      userOp.maxPriorityFeePerGas,
      keccak256(userOp.paymasterAndData),
    ],
  );

  const hash = keccak256(packed);
  const result = encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
    [hash, ENTRY_POINT, BigInt(chainId)],
  );

  return keccak256(result);
};
