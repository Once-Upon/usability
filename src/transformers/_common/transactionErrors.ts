import type { RawBlock } from '../types';

export function transform(block: RawBlock) {
  const allTxErrors: { hash: string; errors: string[] }[] = [];

  for (const tx of block.transactions) {
    const errors: string[] = [];

    for (const trace of tx.traces) {
      if (trace.error) {
        errors.push(trace.error);
      }
    }

    if (errors.length > 0) {
      allTxErrors.push({
        hash: tx.hash,
        errors,
      });
    }
  }

  return allTxErrors;
}
