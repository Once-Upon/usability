import { transform as transactionAssetTransfers } from '../_common/assetTransfers';
import { transform } from './assetTransfersCryptopunks';
import { loadBlockFixture } from '../../helpers/utils';

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
  });
});
