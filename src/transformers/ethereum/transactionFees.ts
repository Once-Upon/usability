import type { RawBlock, RawTransaction } from '../../types';
import { FORKS } from '../../helpers/constants';

export function transform(block: RawBlock) {
  const newTxs: Partial<RawTransaction>[] = [];

  for (const tx of block.transactions) {
    const transactionFee = (
      BigInt(tx.receipt.gasUsed) * BigInt(tx.receipt.effectiveGasPrice)
    ).toString();

    let burntFees = '0';
    let minerFees = transactionFee;

    /***
     * Legacy tx after EIP1559 https://legacy.ethgasstation.info/blog/eip-1559/
     * "EIP-1559 will still be able to facilitate legacy style transactions.
     * When these transactions come in their gas prices are simply converted into fee caps,
     * including respective base fees and tips."
     */
    if (tx.type === 2 && block.number >= FORKS.london) {
      burntFees = (
        BigInt(block.baseFeePerGas) * BigInt(tx.receipt.gasUsed)
      ).toString();
      minerFees = (
        (BigInt(tx.receipt.effectiveGasPrice) - BigInt(block.baseFeePerGas)) *
        BigInt(tx.receipt.gasUsed)
      ).toString();
    }

    newTxs.push({
      hash: tx.hash,
      baseFeePerGas: block.baseFeePerGas,
      burntFees,
      minerFees,
      transactionFee,
    });
  }

  return newTxs;
}
