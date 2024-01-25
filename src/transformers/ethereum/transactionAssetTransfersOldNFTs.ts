import { decodeEVMAddress, toBigNumber } from '../helpers/utils';
import type { AssetTransfer, RawBlock, RawTransaction, transactionAssetTransfers } from '../types';
import {
  KNOWN_ADDRESSES,
  OLD_NFT_ADDRESSES,
  ERC721_TRANSFER_EVENT_1,
  ERC721_TRANSFER_EVENT_2,
} from '../../helpers/constants';
import { decodeEvent } from '../helpers/sigMapper';

const TRANSFER_SIGNATURES = {
  // event Transfer(address,address,uint256)
  ERC721: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',

  // event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)
  CRYPTO_PUNKS_ERC721: '0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8',
};

function updateTokenTransfers(tx: RawTransaction) {
  const oldNFTsTransfers: AssetTransfer[] = [];

  for (const log of tx.receipt.logs) {
    if (!OLD_NFT_ADDRESSES.includes(log.address)) {
      continue;
    }

    const [signature] = log.topics;

    switch (signature) {
      // @NOTE: all of these cases are the same function signature
      case TRANSFER_SIGNATURES.ERC721: {
        // for cryptopunks, we skip Transfer event and parse PunkTransfer
        if (log.address === KNOWN_ADDRESSES.CryptoPunksNew || log.address === KNOWN_ADDRESSES.CryptoPunksOld) {
          continue;
        }

        // check for old nfts
        let logDescriptor = decodeEvent([ERC721_TRANSFER_EVENT_1], log.topics, log.data);
        if (!logDescriptor) {
          logDescriptor = decodeEvent([ERC721_TRANSFER_EVENT_2], log.topics, log.data);
        }
        if (logDescriptor) {
          oldNFTsTransfers.push({
            asset: log.address,
            from: logDescriptor.args[0] as string,
            to: logDescriptor.args[1] as string,
            tokenId: logDescriptor.args[2] as string,
            type: 'erc721',
          });
        } else {
          // if there's a 4th topic (indexed parameter), then it's an ERC721
          if (log.topics.length === 4) {
            oldNFTsTransfers.push({
              asset: log.address,
              from: decodeEVMAddress(log.topics[1]),
              to: decodeEVMAddress(log.topics[2]),
              tokenId: toBigNumber(log.topics[3]).toString(),
              type: 'erc721',
            });
          } else {
            oldNFTsTransfers.push({
              asset: log.address,
              from: decodeEVMAddress(log.topics[1]),
              to: decodeEVMAddress(log.topics[2]),
              value: toBigNumber(log.data).toString(),
              type: 'erc721',
            });
          }
        }

        continue;
      }

      case TRANSFER_SIGNATURES.CRYPTO_PUNKS_ERC721: {
        oldNFTsTransfers.push({
          asset: log.address,
          from: decodeEVMAddress(log.topics[1]),
          to: decodeEVMAddress(log.topics[2]),
          tokenId: toBigNumber(log.data).toString(),
          type: 'erc721',
        });
        continue;
      }

      default:
        break;
    }
  }

  // filter old asset transfers from previous asset transfers
  const nonOldAssetTransfers = tx.assetTransfers.filter(
    (assetTransfer) => !OLD_NFT_ADDRESSES.includes(assetTransfer.asset)
  );
  const assetTransfers = [...nonOldAssetTransfers, ...oldNFTsTransfers];

  return assetTransfers;
}

export function transform(block: RawBlock) {
  const results: transactionAssetTransfers[] = block.transactions.map((tx) => {
    let assetTransfers = tx.assetTransfers;
    const hasOldNFTTransfer = tx.assetTransfers?.some((assetTransfer) =>
      OLD_NFT_ADDRESSES.includes(assetTransfer.asset)
    );
    if (hasOldNFTTransfer) {
      assetTransfers = updateTokenTransfers(tx);
    }

    return { hash: tx.hash, assetTransfers };
  });

  return results;
}
