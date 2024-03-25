import { decodeEventLog, decodeFunctionData, Hex } from 'viem';
import type {
  EventLogTopics,
  PartialTransaction,
  PseudoTransaction,
  PartialReceipt,
  RawLog,
  RawTrace,
} from '../../../types';
import { isRawTransaction, type TxnTransformer } from '../../../helpers/utils';
import { decodeTransactionInput, getUserOpHash } from './utils';

import { decode as simpleAccountDecode } from './accounts/simpleAccount';
import { decode as unknownDecode } from './accounts/unknown';
import { decode as okxDecode } from './accounts/okx';

import { ENTRY_POINT, ABIs } from './constants';

const accountExecutionDecoders = [
  simpleAccountDecode,
  unknownDecode,
  okxDecode,
];

// TODO replace with non-generator impls? so that we don't have to Array.from all the time
function* takeWhile<T>(xs: T[], fn: (v: T) => boolean) {
  for (let x of xs)
    if (fn(x)) yield x;
    else break;
}

function* dropWhile<T>(xs: T[], fn: (v: T) => boolean) {
  for (let x of xs) {
    if (fn(x)) break;
  }
  yield* xs;
}

const filterOutUserOpLogs = (logs: RawLog[], userOpHash: string) => {
  // Filter out the relevant logs for the user op hash from the full transaction logs by:
  // 1. Removing everything up until `BeforeExecution` and everything after the last `UserOperationEvent`
  // 2. Reversing the list
  // 3. Finding the `UserOperationEvent` for the current userOp
  // 4. Taking all logs until the next `UserOperationEvent`
  //
  // NOTE: we need to handle events that don't conform to the EntryPoint
  // ABI here since the UserOp can emit arbitrary events
  const parsedLogs = logs.map((log) => {
    try {
      const { data, topics } = log;
      return {
        parsed: true,
        log,
        decoded: decodeEventLog({
          abi: ABIs.EntryPoint,
          data: data as Hex,
          topics: topics as EventLogTopics,
        }),
      };
    } catch (_) {
      return { parsed: false, log };
    }
  });
  const [_, ...clearBefore] = dropWhile(
    parsedLogs,
    (x) => !x.parsed || x.decoded?.eventName !== 'BeforeExecution',
  );
  const trimmedReversed = dropWhile(
    clearBefore.reverse(),
    (x) => !x.parsed || x.decoded?.eventName !== 'UserOperationEvent',
  );
  const opStart = dropWhile(
    Array.from(trimmedReversed),
    (x) =>
      !x.parsed ||
      x.decoded?.eventName !== 'UserOperationEvent' ||
      x.decoded?.args.userOpHash !== userOpHash,
  );
  return Array.from(
    takeWhile(
      Array.from(opStart),
      (x) =>
        !x.parsed ||
        x.decoded?.eventName !== 'UserOperationEvent' ||
        x.decoded?.args.userOpHash === userOpHash,
    ),
  ).reverse();
};

const filterOutUserOpTraces = (traces: RawTrace[], userOpHash: string) => {
  // Filter out traces for the user op from the full transaction traces by
  // finding the trace { from: entrypoint, to: entrypoint }
  // where the decoded input argument userOpInfo.hash matches, and then take
  // all subtraces by comparing traceAddress
  const opEntryTrace = traces
    .filter(
      ({ action }) => action.from === ENTRY_POINT && action.to === ENTRY_POINT,
    )
    .find((v) => {
      const decoded = decodeFunctionData({
        abi: ABIs.EntryPoint,
        data: v.action.input as Hex,
      });

      if (decoded.functionName !== 'innerHandleOp') return false;

      return decoded.args[1].userOpHash == userOpHash;
    });

  if (!opEntryTrace) return [];

  return traces.filter((v) => {
    for (const [idx, addr] of opEntryTrace.traceAddress.entries()) {
      if (v.traceAddress[idx] !== addr) return false;
    }

    return true;
  });
};

export const unpackERC4337Transactions = (
  transaction: PartialTransaction,
): PseudoTransaction[] => {
  if (
    !transaction.to ||
    transaction.to !== ENTRY_POINT ||
    !isRawTransaction(transaction)
  ) {
    return [];
  }

  const decoded = decodeTransactionInput(
    transaction.input as Hex,
    ABIs.EntryPoint,
  );

  if (!decoded) return [];

  if (decoded.functionName === 'handleOps') {
    const [userOps, benficiary] = decoded.args;

    const bundler = transaction.from;

    const result = userOps.map((v) => {
      const hash = getUserOpHash(v, transaction.chainId);

      const userOpData = {
        maxFeePerGas: v.maxFeePerGas.toString(),
        maxPriorityFeePerGas: v.maxPriorityFeePerGas.toString(),
        from: v.sender.toLowerCase() as Hex,
        data: v.callData,
        input: v.callData,
      };

      let { receipt, traces, ...rest } = transaction;

      const [first, ...otherLogs] = filterOutUserOpLogs(receipt.logs, hash);
      const resultEvent =
        first.decoded?.eventName === 'UserOperationEvent'
          ? first.decoded
          : undefined;

      let userOpReceipt: PartialReceipt = {
        status: resultEvent?.args.success ? 1 : 0,
        logs: otherLogs.map(({ log }) => log),
      };

      if (resultEvent?.args.actualGasUsed) {
        userOpReceipt.gasUsed = Number(resultEvent?.args.actualGasUsed);
      }

      if (resultEvent?.args.actualGasCost) {
        userOpReceipt.effectiveGasPrice = Number(
          resultEvent?.args.actualGasCost,
        );
      }

      const opTraces = filterOutUserOpTraces(traces, hash);

      const intermediateTxn = {
        ...rest,
        ...userOpData,
        userOpHash: hash,
        traces: opTraces,
        receipt: userOpReceipt,
        isERC4337Transaction: true,
        ERC4337Info: {
          bundler,
          benficiary: benficiary.toLowerCase() as Hex,
          entryPoint: ENTRY_POINT,
          userOpHash: hash,
        },
      };

      for (const decoder of accountExecutionDecoders) {
        const result = decoder(intermediateTxn);
        if (result) {
          return {
            ...intermediateTxn,
            ...result,
            to: result.to.toLowerCase() as Hex,
          };
        }
      }

      return transaction;
    });

    return result;
  }

  if (decoded.functionName !== 'handleAggregatedOps') {
    // TODO implement
  }

  return [];
};

export const transform: TxnTransformer = (_block, tx) => {
  if (!isRawTransaction(tx)) return tx;

  const pseudoTransactions = unpackERC4337Transactions(tx);

  return { ...tx, pseudoTransactions };
};
