import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { decodeEVMAddress, toBigNumber } from '../helpers/utils';
import type { AssetTransfer, RawBlock, RawTransaction } from '../types';
import { KNOWN_ADDRESSES } from '../helpers/constants';

// 1. pull out token transfers from logs
// 2. pull out ETH transfers from traces (this covers tx.value transfers)
// 3. order it all by looking at when contracts where called via traces

const TRANSFER_SIGNATURES = {
  // event Transfer(address indexed from, address indexed to, uint256 value)
  ERC20: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',

  // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
  ERC721: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',

  // event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)
  ERC1155_SINGLE: '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',

  // event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)
  ERC1155_BATCH: '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',

  // event Deposit(address indexed dst, uint wad)
  WETH_DEPOSIT_ERC20: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',

  // event Withdrawal(address indexed src, uint wad)
  WETH_WITHDRAW_ERC20: '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
};

// @NOTE: we do *not* need access to an RPC here
//        we just need an instance of Web3 in order to decode some log params
const web3 = new Web3();

function getTokenTransfers(tx: RawTransaction) {
  const txAssetTransfers: AssetTransfer[] = [];

  for (const log of tx.receipt.logs) {
    const [signature] = log.topics;

    switch (signature) {
      // @NOTE: all of these cases are the same function signature
      case TRANSFER_SIGNATURES.ERC20:
      case TRANSFER_SIGNATURES.ERC721: {
        // if there's a 4th topic (indexed parameter), then it's an ERC721
        if (log.topics.length === 4) {
          txAssetTransfers.push({
            asset: log.address,
            from: decodeEVMAddress(log.topics[1]),
            to: decodeEVMAddress(log.topics[2]),
            tokenId: toBigNumber(log.topics[3]).toString(),
            type: 'erc721',
          });
        } else {
          txAssetTransfers.push({
            asset: log.address,
            from: decodeEVMAddress(log.topics[1]),
            to: decodeEVMAddress(log.topics[2]),
            value: toBigNumber(log.data).toString(),
            type: 'erc20',
          });
        }
        continue;
      }

      case TRANSFER_SIGNATURES.ERC1155_SINGLE: {
        const { tokenId, value } = web3.eth.abi.decodeParameters(
          [
            { name: 'tokenId', type: 'uint256' },
            { name: 'value', type: 'uint256' },
          ],
          log.data
        ) as { tokenId: BigNumber; value: BigNumber };

        txAssetTransfers.push({
          asset: log.address,
          from: decodeEVMAddress(log.topics[2]),
          to: decodeEVMAddress(log.topics[3]),
          tokenId: tokenId.toString(),
          value: value.toString(),
          type: 'erc1155',
        });
        continue;
      }

      case TRANSFER_SIGNATURES.ERC1155_BATCH: {
        const { tokenIds, values } = web3.eth.abi.decodeParameters(
          [
            { name: 'tokenIds', type: 'uint256[]' },
            { name: 'values', type: 'uint256[]' },
          ],
          log.data
        ) as { tokenIds: BigNumber[]; values: BigNumber[] };

        for (let tokenIdx = 0; tokenIdx < tokenIds.length; tokenIdx += 1) {
          txAssetTransfers.push({
            asset: log.address,
            from: decodeEVMAddress(log.topics[2]),
            to: decodeEVMAddress(log.topics[3]),
            tokenId: tokenIds[tokenIdx].toString(),
            value: values[tokenIdx].toString(),
            type: 'erc1155',
          });
        }
        continue;
      }

      case TRANSFER_SIGNATURES.WETH_DEPOSIT_ERC20: {
        if (log.address !== KNOWN_ADDRESSES.WETH) {
          continue;
        }

        txAssetTransfers.push({
          asset: log.address,
          from: KNOWN_ADDRESSES.NULL,
          to: decodeEVMAddress(log.topics[1]),
          value: toBigNumber(log.data).toString(),
          type: 'erc20',
        });
        continue;
      }

      case TRANSFER_SIGNATURES.WETH_WITHDRAW_ERC20: {
        if (log.address !== KNOWN_ADDRESSES.WETH) {
          continue;
        }

        txAssetTransfers.push({
          asset: log.address,
          from: decodeEVMAddress(log.topics[1]),
          to: KNOWN_ADDRESSES.NULL,
          value: toBigNumber(log.data).toString(),
          type: 'erc20',
        });
        continue;
      }

      default:
        break;
    }
  }

  return txAssetTransfers;
}

export function transform(block: RawBlock) {
  const results: { hash: string; assetTransfers: AssetTransfer[] }[] = [];

  for (const tx of block.transactions) {
    // don't count transfers for failed txs
    if (!tx.receipt.status) {
      continue;
    }

    // first get all of the token transfers from transaction logs
    const tokenTransfers = getTokenTransfers(tx);

    // then group by contract
    const tokenTransfersByContract: Record<string, AssetTransfer[]> = {};
    for (const transfer of tokenTransfers) {
      if (!tokenTransfersByContract[transfer.asset]) {
        tokenTransfersByContract[transfer.asset] = [];
      }
      tokenTransfersByContract[transfer.asset].push(transfer);
    }

    // now prepare a final set of *all* asset transfers (including ETH)
    const assetTransfers: AssetTransfer[] = [];

    // iterate through the traces
    for (const trace of tx.traces) {
      // check for ETH transfers
      if (trace.action.callType !== 'delegatecall') {
        // track contract suicides
        if (trace.type === 'suicide' && trace.action.balance && trace.action.balance !== '0x0') {
          assetTransfers.push({
            from: trace.action.address,
            to: trace.action.refundAddress,
            type: 'eth',
            value: toBigNumber(trace.action.balance).toString(),
          });
        }
        // otherwise track ETH transfers
        else if (trace.action.value && trace.action.value !== '0x0') {
          assetTransfers.push({
            from: trace.action.from,
            to: trace.type === 'create' ? trace.result.address : trace.action.to,
            type: 'eth',
            value: toBigNumber(trace.action.value).toString(),
          });
        }
      }

      // check if this is a call to one of our asset transfer contracts
      if (
        trace.action.callType?.endsWith('call') &&
        trace.action.to &&
        tokenTransfersByContract[trace.action.to]?.length > 0
      ) {
        assetTransfers.push(...tokenTransfersByContract[trace.action.to]);
        delete tokenTransfersByContract[trace.action.to];
      }
    }

    if (tokenTransfersByContract[tx.to]?.length > 0) {
      assetTransfers.push(...tokenTransfersByContract[tx.to]);
      delete tokenTransfersByContract[tx.to];
    }

    for (const leftOverTxfers of Object.values(tokenTransfersByContract)) {
      assetTransfers.push(...leftOverTxfers);
    }

    if (assetTransfers.length > 0) {
      results.push({
        hash: tx.hash,
        // @NOTE: current ETL codebase splits out `ethFlow` from `assetTransfers`
        assetTransfers,
      });
    }
  }

  return results;
}
