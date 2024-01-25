import { AssetType } from './shared';

export type NetAssetTransfer = {
  asset: string;
  from?: string;
  to?: string;
  id: string;
  tokenId?: string;
  type: AssetType;
  value: string;
};

export type NetAssetTransfers = Record<
  string,
  { received: NetAssetTransfer[]; sent: NetAssetTransfer[] }
>;
