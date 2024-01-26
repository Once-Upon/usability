import type { RawBlock, Contract } from '../../types';

type ContractSelfDestructed = {
  address: string;
  refundAddress: string;
  balance: string;
};

type ResultType = {
  contractsCreated: Contract[];
  contractSelfDestructed: ContractSelfDestructed[];
  hash: string;
};

export function transform(block: RawBlock) {
  const results: ResultType[] = [];

  for (const tx of block.transactions) {
    const result: ResultType = {
      contractsCreated: [],
      contractSelfDestructed: [],
      hash: tx.hash,
    };

    for (let i = 0; i < tx.traces.length; i += 1) {
      const trace = tx.traces[i];

      if (trace.type === 'suicide' && trace.action) {
        result.contractSelfDestructed.push({
          address: trace.action.address,
          balance: trace.action.balance
            ? BigInt(trace.action.balance).toString()
            : '0',
          refundAddress: trace.action.refundAddress ?? '',
        });
      }
    }

    if (result.contractSelfDestructed.length > 0) {
      results.push(result);
    }
  }

  return results;
}
