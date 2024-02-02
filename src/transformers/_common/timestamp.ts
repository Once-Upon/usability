import type { RawBlock } from '../../types';

export function transform(block: RawBlock): RawBlock {
  const isoTimestamp = new Date(block.timestamp * 1000).toISOString();

  block.transactions = block.transactions.map((tx) => {
    tx.timestamp = block.timestamp;
    tx.isoTimestamp = isoTimestamp;
    return tx;
  });

  return block;
}
