import type { Contract, RawBlock, TransactionContract } from '../../types';
import { bytecodeIsERC20 } from '../../helpers/utils';

export function transform(block: RawBlock): TransactionContract[] {
  const results: { hash: string; contracts: Contract[] }[] = [];

  for (const tx of block.transactions) {
    if (!tx.contracts) {
      continue;
    }

    const contracts = tx.contracts.map((txContract) => {
      if (bytecodeIsERC20(txContract.bytecode)) {
        txContract.metadata.tokenMetadata.tokenStandard = 'erc20';
      }
      return txContract;
    });

    results.push({ hash: tx.hash, contracts });
  }

  return results;
}
