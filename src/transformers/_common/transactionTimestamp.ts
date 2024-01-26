import type { RawBlock } from '../../types';

export function transform(block: RawBlock) {
  const isoTimestamp = new Date(block.timestamp * 1000).toISOString();

  return (
    block.transactions?.slice().map((tx) => ({
      hash: tx.hash,
      timestamp: block.timestamp,
      isoTimestamp,
    })) || []
  );
}
