import type { RawBlock, TransactionContract } from '../types';

export function transform(block: RawBlock): TransactionContract[] {
  const isoTimestamp = new Date(block.timestamp * 1000).toISOString();
  const result: TransactionContract[] = [];

  for (const tx of block.transactions) {
    const contracts = tx.contracts.map((txContract) => {
      txContract.timestamp = block.timestamp;
      txContract.isoTimestamp = isoTimestamp;

      return txContract;
    });

    result.push({ hash: tx.hash, contracts });
  }

  return result;
}
