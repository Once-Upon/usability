import type { Contract, RawBlock, TransactionContract } from '../types';
import { bytecodeIsERC1155 } from '../helpers/utils';

export function transform(block: RawBlock): TransactionContract[] {
  const results: { hash: string; contracts: Contract[] }[] = [];

  for (const tx of block.transactions) {
    if (!tx.contracts) {
      continue;
    }

    const contracts = tx.contracts.map((txContract) => {
      if (bytecodeIsERC1155(txContract.bytecode)) {
        txContract.metadata.tokenMetadata.tokenStandard = 'erc1155';
      }
      return txContract;
    });

    results.push({ hash: tx.hash, contracts });
  }

  return results;
}
