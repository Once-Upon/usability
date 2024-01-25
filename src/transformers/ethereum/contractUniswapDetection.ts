import { ethers } from 'ethers';
import type { RawBlock, TransactionContract, UniswapPair } from '../types';
import { decodeEVMAddress } from '../helpers/utils';
import {
  UNISWAP_V3_FACTORY,
  UNISWAP_V2_FACTORY,
  UNISWAP_V1_FACTORY,
  UNISWAP_V3_POOL_CREATED_EVENT,
  UNISWAP_V2_PAIR_CREATED_EVENT,
  UNISWAP_V1_NEW_EXCHANGE_EVENT_HASH,
  UNISWAP_V2_PAIR_CREATED_EVENT_HASH,
  UNISWAP_V3_POOL_CREATED_EVENT_HASH,
} from '../helpers/constants';

export function transform(block: RawBlock): TransactionContract[] {
  const result: TransactionContract[] = block.transactions
    .filter((tx) => tx.contracts?.length > 0)
    .map((tx) => {
      const uniswapV3Pools: UniswapPair[] = tx.receipt.logs
        .filter((log) => log.topics[0] === UNISWAP_V3_POOL_CREATED_EVENT_HASH && log.address === UNISWAP_V3_FACTORY)
        .map((log) => {
          // decode log
          try {
            const iface = new ethers.Interface([UNISWAP_V3_POOL_CREATED_EVENT]);
            const logDescriptor = iface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            // get pool address from decoded log
            const pool = logDescriptor.args[4] as string;
            // get token addresses
            const tokenA = decodeEVMAddress(log.topics[1]);
            const tokenB = decodeEVMAddress(log.topics[2]);

            return {
              address: pool.toLowerCase(),
              tokens: [tokenA.toLowerCase(), tokenB.toLowerCase()],
            };
          } catch (e) {
            return null;
          }
        })
        .filter((v) => v);

      const uniswapV2Pairs: UniswapPair[] = tx.receipt.logs
        .filter((log) => log.topics[0] === UNISWAP_V2_PAIR_CREATED_EVENT_HASH && log.address === UNISWAP_V2_FACTORY)
        .map((log) => {
          // decode log
          try {
            const iface = new ethers.Interface([UNISWAP_V2_PAIR_CREATED_EVENT]);
            const logDescriptor = iface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            // get pool address from decoded log
            const pool = logDescriptor.args[2] as string;
            // get token addresses
            const tokenA = decodeEVMAddress(log.topics[1]);
            const tokenB = decodeEVMAddress(log.topics[2]);

            return {
              address: pool.toLowerCase(),
              tokens: [tokenA.toLowerCase(), tokenB.toLowerCase()],
            };
          } catch (e) {
            return null;
          }
        })
        .filter((v) => v);

      const uniswapV1Exchanges: UniswapPair[] = tx.receipt.logs
        .filter((log) => log.topics[0] === UNISWAP_V1_NEW_EXCHANGE_EVENT_HASH && log.address === UNISWAP_V1_FACTORY)
        .map((log) => {
          // go trough traces and tract create call
          const exchangeCreateTrace = tx.traces.find((trace) => trace.type === 'create');
          const pool = exchangeCreateTrace.result.address;
          // get token addresses
          const tokenA = decodeEVMAddress(log.topics[1]);
          const tokenB = decodeEVMAddress(log.topics[2]);

          return {
            address: pool.toLowerCase(),
            tokens: [tokenA.toLowerCase(), tokenB.toLowerCase()],
          };
        });

      // check contracts
      const contracts = tx.contracts.map((contract) => {
        const v3Pair = uniswapV3Pools.find((pair) => pair.address === contract.address);
        const v2Pair = uniswapV2Pairs.find((pair) => pair.address === contract.address);
        const v1Pair = uniswapV1Exchanges.find((pair) => pair.address === contract.address);
        // check if contract is uniswap v3 pool
        if (v3Pair) {
          contract.metadata.isUniswapV3 = true;
          contract.metadata.uniswapPairs = v3Pair.tokens;
        }
        if (v2Pair) {
          contract.metadata.isUniswapV2 = true;
          contract.metadata.uniswapPairs = v2Pair.tokens;
        }
        if (v1Pair) {
          contract.metadata.isUniswapV1 = true;
          contract.metadata.uniswapPairs = v1Pair.tokens;
        }
        return contract;
      });

      return { hash: tx.hash, contracts };
    });

  return result;
}
