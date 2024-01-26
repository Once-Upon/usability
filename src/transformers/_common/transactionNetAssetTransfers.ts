import {
  type RawBlock,
  type NetAssetTransfers,
  type Asset,
  AssetType,
  ERC1155Asset,
  ERC20Asset,
  ETHAsset,
} from '../../types';

export function transform(block: RawBlock) {
  const results: { hash: string; netAssetTransfers: NetAssetTransfers }[] = [];

  for (const tx of block.transactions) {
    const assetTransfers = tx.assetTransfers;
    if (!assetTransfers?.length) {
      continue;
    }

    const assetsById: Record<string, Asset> = {};
    const netAssetsByAddress: Record<string, Record<string, bigint>> = {};

    for (const txfer of assetTransfers) {
      if (txfer.from === txfer.to || !txfer.from || !txfer.to) {
        continue;
      }

      let asset: Asset | undefined = undefined;
      let assetValue = BigInt(0);
      switch (txfer.type) {
        case 'erc721':
          asset = {
            asset: txfer.asset,
            id: `${txfer.asset}-${txfer.tokenId}`,
            tokenId: txfer.tokenId,
            type: txfer.type,
          };
          assetValue = BigInt(1);
          break;
        case 'erc1155':
          asset = {
            asset: txfer.asset,
            id: `${txfer.asset}-${txfer.tokenId}`,
            tokenId: txfer.tokenId,
            type: txfer.type,
            value: txfer.value,
          };
          assetValue = BigInt(txfer.value);
          break;
        case 'erc20':
          asset = {
            asset: txfer.asset,
            id: `${txfer.asset}`,
            type: txfer.type,
            value: txfer.value,
          };
          assetValue = BigInt(txfer.value);
          break;
        case 'eth':
          asset = {
            id: 'eth',
            type: txfer.type,
            value: txfer.value,
          };
          assetValue = BigInt(txfer.value);
          break;
      }

      if (!asset?.id) {
        continue;
      }

      if (!netAssetsByAddress[txfer.from]) {
        netAssetsByAddress[txfer.from] = {};
      }
      if (!netAssetsByAddress[txfer.to]) {
        netAssetsByAddress[txfer.to] = {};
      }
      if (!netAssetsByAddress[txfer.from][asset.id]) {
        netAssetsByAddress[txfer.from][asset.id] = BigInt(0);
      }
      if (!netAssetsByAddress[txfer.to][asset.id]) {
        netAssetsByAddress[txfer.to][asset.id] = BigInt(0);
      }

      assetsById[asset.id] = asset;
      netAssetsByAddress[txfer.from][asset.id] =
        netAssetsByAddress[txfer.from][asset.id] - BigInt(assetValue);
      netAssetsByAddress[txfer.to][asset.id] =
        netAssetsByAddress[txfer.to][asset.id] + BigInt(assetValue);
    }

    const netAssetTransfers: NetAssetTransfers = {};
    for (const [address, assets] of Object.entries(netAssetsByAddress)) {
      for (const [id, value] of Object.entries(assets)) {
        if (!netAssetTransfers[address]) {
          netAssetTransfers[address] = { received: [], sent: [] };
        }

        const type = assetsById[id].type;
        if (type === AssetType.ERC721) {
          netAssetTransfers[address].sent.push({
            ...assetsById[id],
          });
        } else {
          if (value === BigInt(0)) {
            continue;
          }

          let asset: Asset | undefined = undefined;
          switch (assetsById[id].type) {
            case AssetType.ERC1155:
              asset = assetsById[id] as ERC1155Asset;
              asset.value =
                value > BigInt(0)
                  ? value.toString()
                  : (value * BigInt(-1)).toString();
              netAssetTransfers[address].received.push(asset);
              break;
            case AssetType.ERC20:
              asset = assetsById[id] as ERC20Asset;
              asset.value =
                value > BigInt(0)
                  ? value.toString()
                  : (value * BigInt(-1)).toString();
              netAssetTransfers[address].received.push(asset);
              break;
            case AssetType.ETH:
              asset = assetsById[id] as ETHAsset;
              asset.value =
                value > BigInt(0)
                  ? value.toString()
                  : (value * BigInt(-1)).toString();
              netAssetTransfers[address].received.push(asset);
              break;
          }
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
