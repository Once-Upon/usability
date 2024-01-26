import type { RawBlock, Contract, TransactionContract } from '../../types';
import { bytecodeIsIGovernor } from '../../helpers/utils';

export function transform(block: RawBlock): TransactionContract[] {
  const result: TransactionContract[] = block.transactions
    .filter((tx) => tx.contracts && tx.contracts.length > 0)
    .map((tx) => {
      const contracts: Contract[] = tx.contracts
        ? tx.contracts.map((txContract) => {
            const contract: Contract = { ...txContract };
            if (bytecodeIsIGovernor(txContract.bytecode)) {
              contract.metadata.isGenericGovernance = true;
            }

            return contract;
          })
        : [];

      return { hash: tx.hash, contracts };
    });

  return result;
}
