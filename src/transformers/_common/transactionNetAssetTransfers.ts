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

    for (const assetTransfer of assetTransfers) {
      if (
        assetTransfer.from === assetTransfer.to ||
        !assetTransfer.from ||
        !assetTransfer.to
      ) {
        continue;
      }

      let asset: Asset | undefined = undefined;
      let assetValue = BigInt(0);
      switch (assetTransfer.type) {
        case 'erc721':
          asset = {
            asset: assetTransfer.asset,
            id: `${assetTransfer.asset}-${assetTransfer.tokenId}`,
            tokenId: assetTransfer.tokenId,
            type: assetTransfer.type,
          };
          assetValue = BigInt(1);
          break;
        case 'erc1155':
          asset = {
            asset: assetTransfer.asset,
            id: `${assetTransfer.asset}-${assetTransfer.tokenId}`,
            tokenId: assetTransfer.tokenId,
            type: assetTransfer.type,
            value: assetTransfer.value,
          };
          assetValue = BigInt(assetTransfer.value);
          break;
        case 'erc20':
          asset = {
            asset: assetTransfer.asset,
            id: `${assetTransfer.asset}`,
            type: assetTransfer.type,
            value: assetTransfer.value,
          };
          assetValue = BigInt(assetTransfer.value);
          break;
        case 'eth':
          asset = {
            id: 'eth',
            type: assetTransfer.type,
            value: assetTransfer.value,
          };
          assetValue = BigInt(assetTransfer.value);
          break;
      }

      if (!asset?.id) {
        continue;
      }

      if (!netAssetsByAddress[assetTransfer.from]) {
        netAssetsByAddress[assetTransfer.from] = {};
      }
      if (!netAssetsByAddress[assetTransfer.to]) {
        netAssetsByAddress[assetTransfer.to] = {};
      }
      if (!netAssetsByAddress[assetTransfer.from][asset.id]) {
        netAssetsByAddress[assetTransfer.from][asset.id] = BigInt(0);
      }
      if (!netAssetsByAddress[assetTransfer.to][asset.id]) {
        netAssetsByAddress[assetTransfer.to][asset.id] = BigInt(0);
      }

      assetsById[asset.id] = asset;
      netAssetsByAddress[assetTransfer.from][asset.id] =
        netAssetsByAddress[assetTransfer.from][asset.id] - BigInt(assetValue);
      netAssetsByAddress[assetTransfer.to][asset.id] =
        netAssetsByAddress[assetTransfer.to][asset.id] + BigInt(assetValue);
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
