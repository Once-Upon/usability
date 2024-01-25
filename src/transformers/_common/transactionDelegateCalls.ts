import type { RawBlock, RawTrace } from '../types';

export function transform(block: RawBlock) {
  const results: { hash: string; delegateCalls: RawTrace[] }[] = [];

  for (const tx of block.transactions) {
    const delegateCalls = tx.traces.filter((t) => t.action.callType === 'delegatecall');
    if (delegateCalls.length > 0) {
      results.push({
        hash: tx.hash,
        delegateCalls,
      });
    }
  }

  return results;
}
