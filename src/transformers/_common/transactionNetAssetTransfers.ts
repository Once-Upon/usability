import type {
  RawBlock,
  NetAssetTransfer,
  NetAssetTransfers,
} from '../../types';

export function transform(block: RawBlock) {
  const results: { hash: string; netAssetTransfers: NetAssetTransfers }[] = [];

  for (const tx of block.transactions) {
    const assetTransfers = tx.assetTransfers;
    if (!assetTransfers?.length) {
      continue;
    }

    const assetsById: Record<string, NetAssetTransfer> = {};
    const netAssetsByAddress: Record<string, Record<string, bigint>> = {};

    for (const txfer of assetTransfers) {
      if (txfer.from === txfer.to || !txfer.from || !txfer.to) {
        continue;
      }

      let asset: NetAssetTransfer;
      switch (txfer.type) {
        case 'erc721':
          asset = {
            asset: txfer.asset,
            id: `${txfer.asset}-${txfer.tokenId}`,
            tokenId: txfer.tokenId,
            type: txfer.type,
            value: '1',
          };
          break;
        case 'erc1155':
          asset = {
            asset: txfer.asset,
            id: `${txfer.asset}-${txfer.tokenId}`,
            tokenId: txfer.tokenId,
            type: txfer.type,
            value: txfer.value,
          };
          break;
        case 'erc20':
          asset = {
            asset: txfer.asset,
            id: `${txfer.asset}`,
            type: txfer.type,
            value: txfer.value,
          };
          break;
        case 'eth':
          asset = {
            asset: 'eth',
            id: 'eth',
            type: txfer.type,
            value: txfer.value,
          };
          break;
      }

      if (!asset.id || !asset.value || asset.value === '0') {
        continue;
      }

      if (!netAssetsByAddress[txfer.from]) {
        netAssetsByAddress[txfer.from] = {};
      }
      if (!netAssetsByAddress[txfer.to]) {
        netAssetsByAddress[txfer.to] = {};
      }
      if (!netAssetsByAddress[txfer.from][asset.id]) {
        netAssetsByAddress[txfer.from][asset.id] = toBigNumber(0);
      }
      if (!netAssetsByAddress[txfer.to][asset.id]) {
        netAssetsByAddress[txfer.to][asset.id] = toBigNumber(0);
      }

      assetsById[asset.id] = asset;
      netAssetsByAddress[txfer.from][asset.id] = netAssetsByAddress[txfer.from][
        asset.id
      ].minus(asset.value);
      netAssetsByAddress[txfer.to][asset.id] = netAssetsByAddress[txfer.to][
        asset.id
      ].plus(asset.value);
    }

    const netAssetTransfers: NetAssetTransfers = {};
    for (const [address, assets] of Object.entries(netAssetsByAddress)) {
      for (const [id, value] of Object.entries(assets)) {
        if (value.eq(0)) {
          continue;
        }
        if (!netAssetTransfers[address]) {
          netAssetTransfers[address] = { received: [], sent: [] };
        }
        if (value.lt(0)) {
          netAssetTransfers[address].sent.push({
            ...assetsById[id],
            value: value.multipliedBy(-1).toString(),
          });
        } else {
          netAssetTransfers[address].received.push({
            ...assetsById[id],
            value: value.toString(),
          });
        }
      }
    }

    if (Object.keys(netAssetTransfers).length > 0) {
      results.push({
        hash: tx.hash,
        netAssetTransfers,
      });
    }
  }

  return results;
}
