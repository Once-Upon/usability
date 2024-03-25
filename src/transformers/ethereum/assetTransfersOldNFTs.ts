import { type TxnTransformer, decodeEVMAddress } from '../../helpers/utils';
import {
  AssetType,
  type AssetTransfer,
  type EventLogTopics,
  type PartialTransaction,
} from '../../types';
import {
  KNOWN_ADDRESSES,
  OLD_NFT_ADDRESSES,
  ERC721_TRANSFER_EVENT_1,
  ERC721_TRANSFER_EVENT_2,
} from '../../helpers/constants';
import { decodeEventLog, Hex } from 'viem';

const TRANSFER_SIGNATURES = {
  // event Transfer(address,address,uint256)
  ERC721: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
};

function updateTokenTransfers(tx: PartialTransaction) {
  const oldNFTsTransfers: AssetTransfer[] = [];

  for (const log of tx.receipt.logs) {
    if (!OLD_NFT_ADDRESSES.includes(log.address)) {
      continue;
    }

    const [signature] = log.topics;

    switch (signature) {
      // @NOTE: all of these cases are the same function signature
      case TRANSFER_SIGNATURES.ERC721:
        // for cryptopunks, we skip Transfer event and parse PunkTransfer
        if (
          log.address === KNOWN_ADDRESSES.CryptoPunksNew ||
          log.address === KNOWN_ADDRESSES.CryptoPunksOld
        ) {
          break;
        }

        // check for old nfts
        let logDescriptor;
        try {
          logDescriptor = decodeEventLog({
            abi: ERC721_TRANSFER_EVENT_1,
            data: log.data as Hex,
            topics: log.topics as EventLogTopics,
          });
        } catch (err) {}

        if (!logDescriptor) {
          try {
            logDescriptor = decodeEventLog({
              abi: ERC721_TRANSFER_EVENT_2,
              data: log.data as Hex,
              topics: log.topics as EventLogTopics,
            });
          } catch (err) {}
        }

        if (logDescriptor) {
          oldNFTsTransfers.push({
            asset: log.address,
            from: logDescriptor.args['from'].toLowerCase(),
            to: logDescriptor.args['to'].toLowerCase(),
            tokenId: BigInt(logDescriptor.args['value']).toString(),
            type: AssetType.ERC721,
          });
        } else {
          // if there's a 4th topic (indexed parameter), then it's an ERC721
          if (log.topics.length === 4) {
            oldNFTsTransfers.push({
              asset: log.address,
              from: decodeEVMAddress(log.topics[0]),
              to: decodeEVMAddress(log.topics[1]),
              tokenId: BigInt(log.topics[2]).toString(),
              type: AssetType.ERC721,
            });
          } else {
            oldNFTsTransfers.push({
              asset: log.address,
              from: decodeEVMAddress(log.topics[1]),
              to: decodeEVMAddress(log.topics[2]),
              tokenId: BigInt(log.data).toString(),
              type: AssetType.ERC721,
            });
          }
        }

        break;
      default:
        break;
    }
  }

  // filter old asset transfers from previous asset transfers
  const nonOldAssetTransfers = tx.assetTransfers.filter(
    (assetTransfer) =>
      assetTransfer.type !== AssetType.ETH &&
      !OLD_NFT_ADDRESSES.includes(assetTransfer.asset),
  );
  const assetTransfers = [...nonOldAssetTransfers, ...oldNFTsTransfers];

  return assetTransfers;
}

export const transform: TxnTransformer = (_block, tx) => {
  const hasOldNFTTransfer = tx.assetTransfers?.some(
    (assetTransfer) =>
      assetTransfer.type !== AssetType.ETH &&
      OLD_NFT_ADDRESSES.includes(assetTransfer.asset),
  );
  if (hasOldNFTTransfer) {
    tx.assetTransfers = updateTokenTransfers(tx);
  }
  return tx;
};
