import { whatsabi } from '@shazow/whatsabi';
import type { Contract, RawBlock, TransactionContract } from '../../types';

export function transform(block: RawBlock): TransactionContract[] {
  const results: { hash: string; contracts: Contract[] }[] = [];

  for (const tx of block.transactions) {
    if (!tx.contracts) {
      continue;
    }

    const contracts = tx.contracts
      .map((txContract) => {
        try {
          if (!txContract.metadata) {
            txContract.metadata = {
              isUniswapV3: false,
              isUniswapV2: false,
              isUniswapV1: false,
              uniswapPairs: [],
              isPropHouseToken: false,
              isPropHouseMetadata: false,
              isPropHouseAuction: false,
              isPropHouseTreasury: false,
              isPropHouseGovernor: false,
              isGenericGovernance: false,
              isGnosisSafe: false,
              whatsAbiSelectors: [],
              isProxy: false,
              whatsAbiAbi: [],
              tokenMetadata: { tokenStandard: '' },
            };
          }
          // Get just the callable selectors
          txContract.metadata.whatsAbiSelectors =
            whatsabi.selectorsFromBytecode(txContract.bytecode);
          // Get an ABI-like list of interfaces
          txContract.metadata.whatsAbiAbi = whatsabi.abiFromBytecode(
            txContract.bytecode,
          );

          return txContract;
        } catch (e) {
          return txContract;
        }
      })
      .filter((v) => v);

    if (contracts.length) {
      results.push({ hash: tx.hash, contracts });
    }
  }

  return results;
}
