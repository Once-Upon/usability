import { transform as transactionAssetTransfers } from '../_common/assetTransfers';
import { transform } from './assetTransfersOldNFTs';
import { loadBlockFixture } from '../../helpers/utils';

describe('transactionAssetTransfersOldNFTs', () => {
  it('should return transaction asset transfers old nfts', () => {
    // Special NFT transfers
    /** CryptoKitties */
    const cryptoKittiesBlock = loadBlockFixture('ethereum', 6082465);
    const cryptoKittiesAssetResult =
      transactionAssetTransfers(cryptoKittiesBlock);
    const cryptoKittiesResult = transform(cryptoKittiesAssetResult);
    const cryptoKittiesTx = cryptoKittiesResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0xcb6b23b24d3c0dd8d5ddaf8b9fae50c6742ff8bddf9fe18b4300b5e3ef73fea3',
    );
    expect(cryptoKittiesTx).toBeDefined();
    if (cryptoKittiesTx) {
      const cryptoKittiesTransfers = cryptoKittiesTx.assetTransfers;
      expect(cryptoKittiesTransfers.length).toBe(1);
      if ('tokenId' in cryptoKittiesTransfers[0]) {
        expect(cryptoKittiesTransfers[0].tokenId).toBe('696398');
      }
      expect(cryptoKittiesTransfers[0].type).toBe('erc721');
    }

    /** CryptoStriker */
    const cryptoStrikersBlock = loadBlockFixture('ethereum', 15685187);
    const cryptoStrikersAssetResult =
      transactionAssetTransfers(cryptoStrikersBlock);
    const cryptoStrikersResult = transform(cryptoStrikersAssetResult);
    const cryptoStrikersTx = cryptoStrikersResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0xff760c32edcba188099fbc66ceb97ccd5917da91da7194e8db8f513c267d8d1a',
    );
    expect(cryptoStrikersTx).toBeDefined();
    if (cryptoStrikersTx) {
      const cryptoStrikersTransfers = cryptoStrikersTx.assetTransfers;
      expect(cryptoStrikersTransfers.length).toBe(1);
      expect(cryptoStrikersTransfers[0].type).toBe('erc721');
      if ('tokenId' in cryptoStrikersTransfers[0]) {
        expect(cryptoStrikersTransfers[0].tokenId).toBe('4896');
      }
    }
    /** CryptoFighter */
    const cryptoFightersBlock = loadBlockFixture('ethereum', 16751455);
    const cryptoFightersAssetResult =
      transactionAssetTransfers(cryptoFightersBlock);
    const cryptoFightersResult = transform(cryptoFightersAssetResult);
    const cryptoFightersTx = cryptoFightersResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0xd643017d3ae36bbe76bea7c3ed828ac5388a2698cb313957f8d3958e6bff548f',
    );
    expect(cryptoFightersTx).toBeDefined();
    if (cryptoFightersTx) {
      const cryptoFightersTransfers = cryptoFightersTx.assetTransfers;
      expect(cryptoFightersTransfers.length).toBe(1);
      expect(cryptoFightersTransfers[0].type).toBe('erc721');
      if ('tokenId' in cryptoFightersTransfers[0]) {
        expect(cryptoFightersTransfers[0].tokenId).toBe('3561');
      }
    }
  });

  it('should return asset transfers for Cryptokitties transactions', () => {
    const cryptoKittiesBlock = loadBlockFixture('ethereum', '18815007_decoded');
    const cryptoKittiesAssetResult =
      transactionAssetTransfers(cryptoKittiesBlock);
    const cryptoKittiesResult = transform(cryptoKittiesAssetResult);
    const cryptoKittiesTx = cryptoKittiesResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0x76a07f3f822f6235372804b2ffab705a79b89dbe6a15ad086b6879aa97d60321',
    );
    expect(cryptoKittiesTx).toBeDefined();
    if (cryptoKittiesTx) {
      const cryptoKittiesTransfers = cryptoKittiesTx.assetTransfers;
      expect(cryptoKittiesTransfers.length).toBe(1);
      if ('tokenId' in cryptoKittiesTransfers[0]) {
        expect(cryptoKittiesTransfers[0].tokenId).toBe('2020925');
        expect(cryptoKittiesTransfers[0].from).toBe(
          '0xd695429819d9dd942b2485c3dedd141a774fc774',
        );
        expect(cryptoKittiesTransfers[0].to).toBe(
          '0x82f8cb7e198972e2ef89e0c0cc10ffbd878792a6',
        );
      }
      expect(cryptoKittiesTransfers[0].type).toBe('erc721');
    }

    const cryptoKittiesBlock1 = loadBlockFixture(
      'ethereum',
      '19313444_decoded',
    );
    const cryptoKittiesAssetResult1 =
      transactionAssetTransfers(cryptoKittiesBlock1);
    const cryptoKittiesResult1 = transform(cryptoKittiesAssetResult1);
    const cryptoKittiesTx1 = cryptoKittiesResult1.transactions.find(
      (tx) =>
        tx.hash ===
        '0xf3a7cbc426ad7278fb1c2c52ec0c7c0f41eb91a314b8059cb8cbefe0128f2a2e',
    );
    expect(cryptoKittiesTx1).toBeDefined();
    if (cryptoKittiesTx1) {
      const cryptoKittiesTransfers = cryptoKittiesTx1.assetTransfers;
      expect(cryptoKittiesTransfers.length).toBe(1);
      if ('tokenId' in cryptoKittiesTransfers[0]) {
        expect(cryptoKittiesTransfers[0].tokenId).toBe('2023617');
        expect(cryptoKittiesTransfers[0].from).toBe(
          '0x0000000000000000000000000000000000000000',
        );
        expect(cryptoKittiesTransfers[0].to).toBe(
          '0x74a61f3efe8d3194d96cc734b3b946933feb6a84',
        );
      }
      expect(cryptoKittiesTransfers[0].type).toBe('erc721');
    }
  });
});
