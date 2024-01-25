import type { RawBlock } from '../types';
import { FORKS } from '../helpers/constants';

export function transform(block: RawBlock) {
  let fork: string;

  for (const [forkName, forkNumber] of Object.entries(FORKS)) {
    if (block.number >= forkNumber) {
      fork = forkName;
    }
  }

  return block.transactions?.slice().map((tx) => ({ hash: tx.hash, fork })) || [];
}
