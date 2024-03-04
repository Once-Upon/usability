import { decodeEVMAddress } from '../../helpers/utils';
import {
  AssetType,
  type AssetTransfer,
  type RawBlock,
  type RawTransaction,
} from '../../types';
import { CRYPTO_PUNKS_ADDRESSES } from '../../helpers/constants';

const TRANSFER_SIGNATURES = {
  // event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex)
  CRYPTO_PUNKS_ERC721:
    '0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8',
  // event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress)
  CRYPTO_PUNKS_ERC721_BUY:
    '0x58e5d5a525e3b40bc15abaa38b5882678db1ee68befd2f60bafe3a7fd06db9e3',
};

function updateTokenTransfers(tx: RawTransaction) {
  const cryptopunksTransfers: AssetTransfer[] = [];

  for (const log of tx.receipt.logs) {
    if (!CRYPTO_PUNKS_ADDRESSES.includes(log.address)) {
      continue;
    }

    const [signature] = log.topics;

    switch (signature) {
      case TRANSFER_SIGNATURES.CRYPTO_PUNKS_ERC721:
        cryptopunksTransfers.push({
          contract: log.address,
          from: decodeEVMAddress(log.topics[1]),
          to: decodeEVMAddress(log.topics[2]),
          tokenId: BigInt(log.data).toString(),
          type: AssetType.ERC721,
        });
        break;
      case TRANSFER_SIGNATURES.CRYPTO_PUNKS_ERC721_BUY:
        cryptopunksTransfers.push({
          contract: log.address,
          from: decodeEVMAddress(log.topics[2]),
          to: decodeEVMAddress(log.topics[3]),
          tokenId: BigInt(log.topics[1]).toString(),
          type: AssetType.ERC721,
        });
        break;
      default:
        break;
    }
  }

  // filter old asset transfers from previous asset transfers
  const nonOldAssetTransfers = tx.assetTransfers.filter(
    (assetTransfer) =>
      assetTransfer.type !== AssetType.ETH &&
      !CRYPTO_PUNKS_ADDRESSES.includes(assetTransfer.contract),
  );
  const assetTransfers = [...nonOldAssetTransfers, ...cryptopunksTransfers];

  return assetTransfers;
}

export function transform(block: RawBlock): RawBlock {
  block.transactions = block.transactions.map((tx) => {
    const hasCryptopunksTransfer = tx.assetTransfers?.some(
      (assetTransfer) =>
        assetTransfer.type !== AssetType.ETH &&
        CRYPTO_PUNKS_ADDRESSES.includes(assetTransfer.contract),
    );
    if (hasCryptopunksTransfer) {
      tx.assetTransfers = updateTokenTransfers(tx);
    }
    return tx;
  });

  return block;
}
