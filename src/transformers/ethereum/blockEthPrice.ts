import BigNumber from 'bignumber.js';

import etherscanPrices from '../helpers/etherscan_prices.json';
import { toBigNumber } from '../helpers/utils';
import { RawBlock } from '../types';
import { decodeEvent } from '../helpers/sigMapper';

const ETH_DECIMALS = Math.pow(10, 18);
const USD_DECIMALS = Math.pow(10, 6);

// put some rough safe guards around removing huge price swings
const MIN_USD_AMOUNT_TO_CONSIDER = 100;
const MAX_USD_AMOUNT_TO_CONSIDER = 10000;

const etherscanPriceByDay: Record<string, number> = {};
for (const { UTCDate, value } of etherscanPrices.result) {
  etherscanPriceByDay[UTCDate] = parseFloat(value);
}

// define the Uniswap pools we want to use
const uniSwapV1USDC = '0x97dec872013f6b5fb443861090ad931542878126';
const uniSwapV2ETHPools = new Set<string>([
  '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc', // V2: USDC
  '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852', // V2: USDT
]);
const uniSwapV3ETHPools = new Set<string>([
  '0x7bea39867e4169dbe237d55c8242a8f2fcdcc387', // V3: USDC 1
  '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8', // V3: USDC 2
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', // V3: USDC 3
  '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', // V3: USDT 1
  '0xc5af84701f98fa483ece78af83f11b6c38aca71d', // V3: USDT 2
  '0x11b815efb8f581194ae79006d24e0d814b7697f6', // V3: USDT 3
]);

export function transform(block: RawBlock) {
  const result: {
    number: number;
    price?: number;
    priceSource?: 'ETHERSCAN' | 'UNISWAP';
  } = { number: block.number };
  const date = new Date(block.timestamp * 1000);
  const swaps: { price: BigNumber; volume: BigNumber }[] = [];

  // if we're pre UniSwap usage (~ February 2019), then use Etherscan prices
  if (block.number < 7207017) {
    // only track the price for the block right at midnight
    if (
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() < 30
    ) {
      result.price =
        etherscanPriceByDay[
          `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
        ];
      result.priceSource = 'ETHERSCAN';
    }
  }

  // for the next year, look at adding liquidity to the original USDC Uniswap "pool"
  else if (block.number < 10093190) {
    for (const tx of block.transactions) {
      for (const log of tx.receipt.logs) {
        if (
          log.address === uniSwapV1USDC &&
          log.topics[0] ===
            '0x06239653922ac7bea6aa2b19dc486b9361821d37712eb796adfd38d81de278ca'
        ) {
          const usd = toBigNumber(log.topics[3]).div(USD_DECIMALS);
          if (usd.gte(MIN_USD_AMOUNT_TO_CONSIDER)) {
            const eth = toBigNumber(log.topics[2]).div(ETH_DECIMALS);
            swaps.push({ price: usd.dividedBy(eth), volume: usd });
          }
        }
      }
    }
  }

  // and after May 2020, look to swaps on USDC and USDT Uniswap Pools
  else {
    for (const tx of block.transactions) {
      for (const log of tx.receipt.logs) {
        let amounts: BigNumber[] = [];

        // check V2 swap logs
        if (
          uniSwapV2ETHPools.has(log.address) &&
          log.topics[0] ===
            '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822' &&
          log.topics.length === 3
        ) {
          const params = decodeEvent(
            [
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: 'address',
                    name: 'sender',
                    type: 'address',
                  },
                  {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'amount0In',
                    type: 'uint256',
                  },
                  {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'amount1In',
                    type: 'uint256',
                  },
                  {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'amount0Out',
                    type: 'uint256',
                  },
                  {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'amount1Out',
                    type: 'uint256',
                  },
                  {
                    indexed: true,
                    internalType: 'address',
                    name: 'to',
                    type: 'address',
                  },
                ],
                name: 'Swap',
                type: 'event',
              },
            ],
            log.topics,
            log.data,
          );

          // first 4 data params are possible amounts, only 2 are used
          amounts = params.args.slice(1, 5).map((v) => toBigNumber(v));
        }

        // and check V3 swap logs
        else if (
          uniSwapV3ETHPools.has(log.address) &&
          log.topics[0] ===
            '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67' &&
          log.topics.length === 3
        ) {
          const params = decodeEvent(
            [
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: 'address',
                    name: 'sender',
                    type: 'address',
                  },
                  {
                    indexed: true,
                    internalType: 'address',
                    name: 'recipient',
                    type: 'address',
                  },
                  {
                    indexed: false,
                    internalType: 'int256',
                    name: 'amount0',
                    type: 'int256',
                  },
                  {
                    indexed: false,
                    internalType: 'int256',
                    name: 'amount1',
                    type: 'int256',
                  },
                  {
                    indexed: false,
                    internalType: 'uint160',
                    name: 'sqrtPriceX96',
                    type: 'uint160',
                  },
                  {
                    indexed: false,
                    internalType: 'uint128',
                    name: 'liquidity',
                    type: 'uint128',
                  },
                  {
                    indexed: false,
                    internalType: 'int24',
                    name: 'tick',
                    type: 'int24',
                  },
                ],
                name: 'Swap',
                type: 'event',
              },
            ],
            log.topics,
            log.data,
          );

          // first 2 data params are possible amounts, one is always negative
          amounts = params.args.slice(2, 4).map((v) => toBigNumber(v).abs());
        }

        if (amounts.length >= 2) {
          // because ETH has 3x the decimals, it will always be the larger number prior to normalizing
          let [usd, eth] = amounts
            .filter((a) => a.gt(0))
            .sort((a, b) => (a.gt(b) ? 1 : -1));
          if (!usd || !eth) {
            continue;
          }

          usd = usd.div(USD_DECIMALS);
          if (
            usd.gte(MIN_USD_AMOUNT_TO_CONSIDER) &&
            usd.lte(MAX_USD_AMOUNT_TO_CONSIDER)
          ) {
            eth = eth.div(ETH_DECIMALS);
            swaps.push({ price: usd.dividedBy(eth), volume: usd });
          }
        }
      }
    }
  }

  // compute a quick Volume Weight Average Price (VWAP) for the block
  if (swaps.length) {
    const totalVolume = swaps.reduce(
      (a, b) => a.plus(b.volume),
      toBigNumber(0),
    );
    const price = swaps
      .reduce((a, b) => a.plus(b.price.multipliedBy(b.volume)), toBigNumber(0))
      .div(totalVolume);
    result.price = price.decimalPlaces(2).toNumber();
    result.priceSource = 'UNISWAP';
  }

  if (!result.price) {
    delete result.price;
    delete result.priceSource;
  }
  return result;
}
