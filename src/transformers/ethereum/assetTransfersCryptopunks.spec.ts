import { transform as _transactionAssetTransfers } from '../_common/assetTransfers';
import { transform as _transform } from './assetTransfersCryptopunks';
import { loadBlockFixture, makeTransform } from '../../helpers/utils';

const transactionAssetTransfers = makeTransform({
  test: _transactionAssetTransfers,
});
const transform = makeTransform({ test: _transform });

describe('transactionAssetTransfersCryptopunks', () => {
  it('should return transaction asset transfers CryptoPunks', () => {
    // Special NFT transfers
    /** CryptoPunks New */
    const cryptoPunksNewBlock = loadBlockFixture('ethereum', 5774644);
    const cryptoPunksNewAssetResult =
      transactionAssetTransfers(cryptoPunksNewBlock);
    const cryptoPunksNewResult = transform(cryptoPunksNewAssetResult);
    const cryptoPunksNewTx = cryptoPunksNewResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0x0da4c50900119b47400d71a9dd3563571145e4e362b952c36a9e38c77f7d25bb',
    );
    expect(cryptoPunksNewTx).toBeDefined();
    if (cryptoPunksNewTx) {
      const cryptoPunksNewTransfers = cryptoPunksNewTx.assetTransfers;
      expect(cryptoPunksNewTransfers[0].type).toBe('erc721');
      if ('tokenId' in cryptoPunksNewTransfers[0]) {
        expect(cryptoPunksNewTransfers[0].tokenId).toBe('89');
      }
    }
    /** CryptoPunks Old */
    const cryptoPunksOldBlock = loadBlockFixture('ethereum', 3862484);
    const cryptoPunksOldAssetResult =
      transactionAssetTransfers(cryptoPunksOldBlock);
    const cryptoPunksOldResult = transform(cryptoPunksOldAssetResult);
    const cryptoPunksOldTx = cryptoPunksOldResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0xff75a6739be926fe7328167011b5e2ac6a8883f55e76af70410520ef7b115901',
    );
    expect(cryptoPunksOldTx).toBeDefined();
    if (cryptoPunksOldTx) {
      const cryptoPunksOldTransfers = cryptoPunksOldTx.assetTransfers;
      expect(cryptoPunksOldTransfers[0].type).toBe('erc721');
      if ('tokenId' in cryptoPunksOldTransfers[0]) {
        expect(cryptoPunksOldTransfers[0].tokenId).toBe('4851');
      }
    }
  });

  it('should return asset transfers for CryptoPunks transactions', () => {
    const cryptoPunksBlock = loadBlockFixture('ethereum', '19321357_decoded');
    const cryptoPunksAssetResult = transactionAssetTransfers(cryptoPunksBlock);
    const cryptoPunksResult = transform(cryptoPunksAssetResult);
    const cryptoPunksTx = cryptoPunksResult.transactions.find(
      (tx) =>
        tx.hash ===
        '0x4b581466cca3f2b50a6b97c053dd207feb911c6f858f21331ff829aa97dc6159',
    );
    expect(cryptoPunksTx).toBeDefined();
    if (cryptoPunksTx) {
      const cryptoPunksTransfers = cryptoPunksTx.assetTransfers;
      expect(cryptoPunksTransfers.length).toBe(1);
      if ('tokenId' in cryptoPunksTransfers[0]) {
        expect(cryptoPunksTransfers[0].tokenId).toBe('7071');
        expect(cryptoPunksTransfers[0].from).toBe(
          '0x4e6d2af4931681a024da8feaa4faba2bf8bbdc65',
        );
        expect(cryptoPunksTransfers[0].to).toBe(
          '0x1919db36ca2fa2e15f9000fd9cdc2edcf863e685',
        );
      }
      expect(cryptoPunksTransfers[0].type).toBe('erc721');
    }

    const cryptoPunksBlock1 = loadBlockFixture('ethereum', '19363120_decoded');
    const cryptoPunksAssetResult1 =
      transactionAssetTransfers(cryptoPunksBlock1);
    const cryptoPunksResult1 = transform(cryptoPunksAssetResult1);
    const cryptoPunksTx1 = cryptoPunksResult1.transactions.find(
      (tx) =>
        tx.hash ===
        '0x61c6007a23dee8301b7f3e0546ac596087a8496900e0b5a6e1eace3fafc9905d',
    );
    expect(cryptoPunksTx1).toBeDefined();
    if (cryptoPunksTx1) {
      const cryptoPunksTransfers = cryptoPunksTx1.assetTransfers;
      expect(cryptoPunksTransfers.length).toBe(1);
      if ('tokenId' in cryptoPunksTransfers[0]) {
        expect(cryptoPunksTransfers[0].tokenId).toBe('8379');
        expect(cryptoPunksTransfers[0].from).toBe(
          '0xbb26a6da4d918682f58cc91bd3fb251dd28549d2',
        );
        expect(cryptoPunksTransfers[0].to).toBe(
          '0x347e9f9ddd45bf8a77db9aaa8f06d671698f8dc2',
        );
      }
      expect(cryptoPunksTransfers[0].type).toBe('erc721');
    }

    const cryptoPunksBlock2 = loadBlockFixture('ethereum', '19362604_decoded');
    const cryptoPunksAssetResult2 =
      transactionAssetTransfers(cryptoPunksBlock2);
    const cryptoPunksResult2 = transform(cryptoPunksAssetResult2);
    const cryptoPunksTx2 = cryptoPunksResult2.transactions.find(
      (tx) =>
        tx.hash ===
        '0x9fbc06d3025c257a5e5d1f3c4c320fbfd18bdb43083e25f5d5b318e4b1300f15',
    );
    expect(cryptoPunksTx2).toBeDefined();
    if (cryptoPunksTx2) {
      const cryptoPunksTransfers = cryptoPunksTx2.assetTransfers;
      expect(cryptoPunksTransfers.length).toBe(2);
      if ('tokenId' in cryptoPunksTransfers[0]) {
        expect(cryptoPunksTransfers[0].tokenId).toBe('1848');
        expect(cryptoPunksTransfers[0].from).toBe(
          '0x1919db36ca2fa2e15f9000fd9cdc2edcf863e685',
        );
        expect(cryptoPunksTransfers[0].to).toBe(
          '0x0000000000000000000000000000000000000000',
        );
      }
      expect(cryptoPunksTransfers[0].type).toBe('erc721');

      if ('tokenId' in cryptoPunksTransfers[1]) {
        expect(cryptoPunksTransfers[1].tokenId).toBe('1848');
        expect(cryptoPunksTransfers[1].from).toBe(
          '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6',
        );
        expect(cryptoPunksTransfers[1].to).toBe(
          '0x1919db36ca2fa2e15f9000fd9cdc2edcf863e685',
        );
      }
      expect(cryptoPunksTransfers[1].type).toBe('erc721');
    }
  });

  it('should return asset transfers for CryptoPunks assign transactions', () => {
    const cryptoPunksBlock1 = loadBlockFixture('ethereum', '3846659_decoded');
    const cryptoPunksAssetResult1 =
      transactionAssetTransfers(cryptoPunksBlock1);
    const cryptoPunksResult1 = transform(cryptoPunksAssetResult1);
    const cryptoPunksTx1 = cryptoPunksResult1.transactions.find(
      (tx) =>
        tx.hash ===
        '0xd7eecc44abcea1a4c9dbd7d7749595635f5dcf8d1795beef52ca36356be6201c',
    );
    expect(cryptoPunksTx1).toBeDefined();
    if (cryptoPunksTx1) {
      const cryptoPunksTransfers = cryptoPunksTx1.assetTransfers;
      expect(cryptoPunksTransfers.length).toBe(1);
      if ('tokenId' in cryptoPunksTransfers[0]) {
        expect(cryptoPunksTransfers[0].tokenId).toBe('5350');
        expect(cryptoPunksTransfers[0].from).toBe(
          '0x0000000000000000000000000000000000000000',
        );
        expect(cryptoPunksTransfers[0].to).toBe(
          '0x5b098b00621eda6a96b7a476220661ad265f083f',
        );
      }
      expect(cryptoPunksTransfers[0].type).toBe('erc721');
    }
  });
});
