import { keccak256 } from 'web3-utils';
import type { RawBlock, Contract } from '../../types';

type ResultType = {
  contracts: Contract[];
  hash: string;
};
export function transform(block: RawBlock) {
  const results: ResultType[] = [];

  for (const tx of block.transactions) {
    const result: ResultType = {
      contracts: [],
      hash: tx.hash,
    };

    for (let i = 0; i < tx.traces.length; i += 1) {
      const trace = tx.traces[i];

      if (
        (trace.type === 'create' || trace.type == 'create2') &&
        trace.result
      ) {
        // Basic Create Contract Details
        const isoTimestamp = new Date(block.timestamp * 1000).toISOString();
        if (!trace.result.address) {
          continue;
        }

        const contract: Contract = {
          deployer: tx.from,
          directDeployer: trace.action.from,
          address: trace.result.address,
          bytecode: trace.result.code,
          fingerprint:
            trace.result.code !== '0x0' ? keccak256(trace.result.code) : '', // TODO - need a way to avoid validation errors
          gas: trace.action.gas, // TOOD - do we convert with bignumber here?
          gasUsed: trace.result.gasUsed, // TODO - do we convert with bignumber here?
          blockNumber: block.number,
          transactionHash: tx.hash,
          type: trace.type,
          metadata: {
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
            whatsAbiAbi: [],
            isProxy: false,
            tokenMetadata: {
              tokenStandard: '',
              name: '',
              symbol: '',
              decimals: 0,
            },
          },
          sigHash: '',
          internalSigHashes: [],
          transactionIndex: tx.transactionIndex as number,
          traceIndex: i,

          ethTransfer: false,
          timestamp: block.timestamp,
          isoTimestamp,
        };

        result.contracts.push(contract);
      }
    }

    if (result.contracts.length > 0) {
      results.push(result);
    }
  }

  return results;
}
