import type { RawBlock, RawTransaction } from '../../types';

export function transform(block: RawBlock) {
  const newTxs: Partial<RawTransaction>[] = [];

  for (const tx of block.transactions) {
    let totalL2FeeWei = BigInt(0);
    if (tx.gasPrice) {
      const l2GasPrice = BigInt(tx.gasPrice);
      const l2GasUsed = BigInt(tx.receipt?.gasUsed ?? 0);

      const tenToTheEighteenth = BigInt('1000000000000000000');

      const l1FeeContribution = !tx.receipt?.l1GasUsed
        ? BigInt(0)
        : (BigInt(tx.receipt?.l1GasPrice ?? 0) *
            BigInt(tx.receipt.l1GasUsed) *
            BigInt(
              parseFloat(tx.receipt?.l1FeeScalar ?? '0') * Math.pow(10, 18),
            )) /
          tenToTheEighteenth;

      const l2FeeContribution = l2GasPrice * l2GasUsed;

      totalL2FeeWei = l2FeeContribution + l1FeeContribution;
    }

    newTxs.push({
      hash: tx.hash,
      baseFeePerGas: block.baseFeePerGas,
      transactionFee: totalL2FeeWei.toString(),
    });
  }

  return newTxs;
}
