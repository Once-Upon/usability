import type {
  RawBlock,
  TransactionWithHash,
  InternalHashType,
} from '../../types';

export function transform(block: RawBlock): TransactionWithHash[] {
  const result: TransactionWithHash[] = block.transactions.map((tx) => {
    const sigHash = tx.input.slice(0, 10);
    const internalSigHashes: InternalHashType[] = tx.traces.map((trace) => ({
      from: trace.action.from,
      to: trace.action.to,
      sigHash: String(trace.action.input).slice(0, 10),
    }));

    return { hash: tx.hash, sigHash, internalSigHashes };
  });

  return result;
}
