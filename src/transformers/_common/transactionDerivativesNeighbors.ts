import type { RawBlock, Neighbor } from '../../types';

export function transform(block: RawBlock): Neighbor[] {
  const result: Neighbor[] = [];
  for (let i = 0; i < block.transactions.length; i++) {
    const tx = block.transactions[i];
    if (tx.assetTransfers) {
      const fromAddresses: Set<string> = new Set(
        (tx.assetTransfers as { from: string }[]).map(
          (assetTransfer) => assetTransfer.from,
        ),
      );
      const toAddresses: Set<string> = new Set(
        (tx.assetTransfers as { to: string }[]).map(
          (assetTransfer) => assetTransfer.to,
        ),
      );
      if (
        fromAddresses.size === 1 &&
        fromAddresses.has(tx.from) &&
        toAddresses.size === 1
      ) {
        result.push({
          hash: tx.hash,
          neighbor: { address: tx.from, neighbor: [...toAddresses][0] },
        });
      }
    }
  }

  return result;
}
