import { toBigNumber } from '../helpers/utils';
import type { RawBlock } from '../types';

type ContractSelfDestructed = { address: string; refundAddress: string; balance: string };

export function transform(block: RawBlock) {
  const results: {
    contractSelfDestructed: ContractSelfDestructed[];
    hash: string;
  }[] = [];

  for (const tx of block.transactions) {
    const result = {
      contractsCreated: [],
      contractSelfDestructed: [],
      hash: tx.hash,
    };

    for (let i = 0; i < tx.traces.length; i += 1) {
      const trace = tx.traces[i];

      if (trace.type === 'suicide' && trace.action) {
        result.contractSelfDestructed.push({
          address: trace.action.address,
          balance: toBigNumber(trace.action.balance).toString(),
          refundAddress: trace.action.refundAddress,
        });
      }
    }

    if (result.contractSelfDestructed.length > 0) {
      results.push(result);
    }
  }

  return results;
}
