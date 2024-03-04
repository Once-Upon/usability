import { transform as transactionAssetTransfers } from './assetTransfers';
import { transform as transactionAssetTransfersOldNFTs } from './../ethereum/assetTransfersOldNFTs';
import { transform } from './netAssetTransfers';
import { loadBlockFixture } from '../../helpers/utils';
import { KNOWN_ADDRESSES } from '../../helpers/constants';

describe('transactionNetAssetTransfers', () => {
  it('should return net asset transfers', () => {
    const block = loadBlockFixture('ethereum', 16628971);
    const assetResult = transactionAssetTransfers(block);
    const result = transform(assetResult);
    const comboTx = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0xd175f7d3e34f46e68a036fcccb8abbd3610095e753bd64f50586e4ec51e94167',
    );
    expect(comboTx).toBeDefined();
    if (comboTx) {
      const comboTransfers = comboTx.netAssetTransfers;
      expect(Object.keys(comboTransfers).length).toBe(4);
      expect(comboTransfers[KNOWN_ADDRESSES.NULL].sent.length).toBe(0);
      expect(comboTransfers[KNOWN_ADDRESSES.NULL].received).toStrictEqual([
        {
          contract: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          type: 'erc20',
          value: '1813694121453461568',
        },
      ]);
    }
  });

  it('should return net asset transfers for old nfts', () => {
    const cryptoKittiesBlock = loadBlockFixture('ethereum', '18815007_decoded');
    const cryptoKittiesAssetResult =
      transactionAssetTransfers(cryptoKittiesBlock);
    const cryptoKittiesResult = transactionAssetTransfersOldNFTs(
      cryptoKittiesAssetResult,
    );
    const assetResult = transform(cryptoKittiesResult);
    const cryptoKittiesTx = assetResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0x76a07f3f822f6235372804b2ffab705a79b89dbe6a15ad086b6879aa97d60321',
    );
    expect(cryptoKittiesTx).toBeDefined();
    if (cryptoKittiesTx) {
      const ckTransfers = cryptoKittiesTx.netAssetTransfers;
      expect(Object.keys(ckTransfers).length).toBe(2);
      expect(
        ckTransfers['0x82f8cb7e198972e2ef89e0c0cc10ffbd878792a6'].sent.length,
      ).toBe(0);
      expect(
        ckTransfers['0x82f8cb7e198972e2ef89e0c0cc10ffbd878792a6'].received,
      ).toStrictEqual([
        {
          contract: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
          tokenId: '2020925',
          type: 'erc721',
        },
      ]);
    }

    const cryptoKittiesBlock1 = loadBlockFixture(
      'ethereum',
      '19313444_decoded',
    );
    const cryptoKittiesAssetResult1 =
      transactionAssetTransfers(cryptoKittiesBlock1);
    const cryptoKittiesResult1 = transactionAssetTransfersOldNFTs(
      cryptoKittiesAssetResult1,
    );
    const assetResult1 = transform(cryptoKittiesResult1);
    const cryptoKittiesTx1 = assetResult1.transactions.find(
      (tx) =>
        tx.hash ===
        '0xf3a7cbc426ad7278fb1c2c52ec0c7c0f41eb91a314b8059cb8cbefe0128f2a2e',
    );
    expect(cryptoKittiesTx1).toBeDefined();
    if (cryptoKittiesTx1) {
      const ckTransfers = cryptoKittiesTx1.netAssetTransfers;
      expect(Object.keys(ckTransfers).length).toBe(2);
      expect(
        ckTransfers['0x74a61f3efe8d3194d96cc734b3b946933feb6a84'].sent.length,
      ).toBe(0);
      expect(
        ckTransfers['0x74a61f3efe8d3194d96cc734b3b946933feb6a84'].received,
      ).toStrictEqual([
        {
          contract: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
          tokenId: '2023617',
          type: 'erc721',
        },
      ]);
    }
  });
});
