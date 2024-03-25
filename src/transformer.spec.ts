import { loadBlockFixture } from './helpers/utils';
import { transformer } from './transformers';
import { ENTRY_POINT } from './transformers/_common/accountAbstraction/constants';

describe('transformations', () => {
  it('should transform block', () => {
    const block = loadBlockFixture('ethereum', '17686037_decode');
    const result = transformer.transform(block);

    // testing direct ETH transfer in tx: https://www.onceupon.gg/finder/0x9e7654743c06585d5754ee9cfd087b50f431484d53a757d57d5b51144e51bc95
    const tx = result.transactions.find(
      (wr) =>
        wr.hash ===
        '0x72cc019455568a55ca91c91268873ca4c692df1b5023d5e756fabfb9af48dae0',
    );
    expect(tx).toBeDefined();
    if (tx) {
      // asset transfers
      const assetTransfers = tx.assetTransfers;
      expect(assetTransfers.length).toBe(1);
      expect(assetTransfers[0].type).toBe('eth');
      if ('value' in assetTransfers[0]) {
        expect(assetTransfers?.[0].value).toBe('71596417211722829');
      }
      // net asset transfers
      const netAssetTransfers = tx.netAssetTransfers;
      expect(Object.keys(netAssetTransfers).length).toBe(2);
      expect(
        netAssetTransfers['0x690b9a9e9aa1c9db991c7721a92d351db4fac990'].received
          .length,
      ).toBe(0);
      expect(
        netAssetTransfers['0x690b9a9e9aa1c9db991c7721a92d351db4fac990'].sent,
      ).toStrictEqual([
        {
          id: 'eth',
          type: 'eth',
          value: '71596417211722829',
        },
      ]);
      // transaction parties
      expect(tx.parties).toStrictEqual([
        '0x690b9a9e9aa1c9db991c7721a92d351db4fac990',
        '0x388c818ca8b9251b393131c08a736a67ccb19297',
      ]);
      // sigHash
      expect(tx.sigHash).toBe('0x');
      expect(tx.internalSigHashes).toStrictEqual([
        {
          from: '0x690b9a9e9aa1c9db991c7721a92d351db4fac990',
          sigHash: '0x',
          to: '0x388c818ca8b9251b393131c08a736a67ccb19297',
        },
      ]);
      // timestamp
      expect(tx.timestamp).toBe(1689269015);
      // fees
      expect(tx.baseFeePerGas).toBe(49897163985);
      expect(tx.transactionFee).toBe('1103276192872335');
    }

    const block1 = loadBlockFixture('ethereum', '19313444_decoded');
    const result1 = transformer.transform(block1);
    const cryptoKittiesTx1 = result1.transactions.find(
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
          asset: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
          id: '0x06012c8cf97bead5deae237070f9587f8e7a266d-2023617',
          tokenId: '2023617',
          type: 'erc721',
        },
      ]);
    }
  });

  it('should unpack and transform pseudoTransactions', () => {
    const block = loadBlockFixture('ethereum', 19_298_068);
    const result = transformer.transform(block);

    const txn = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0x7a5e7d32380ae2ca3064b7fbc41e0d698cb7826f61a941737902f4a74a979ca7',
    );
    expect(txn).toBeDefined();

    // 4337 transactions should include an eth transfer from entry point to benficiary
    const beneficiary = '0x12a39672ae8ae8e87e12a5de53c34690d830365c';

    expect(txn).toMatchObject({
      assetTransfers: expect.arrayContaining([
        expect.objectContaining({
          type: 'eth',
          from: ENTRY_POINT,
          to: beneficiary,
        }),
      ]),
    });

    expect(txn?.pseudoTransactions).toBeDefined();
    expect(txn?.pseudoTransactions?.length).toBe(1);

    // pseudo transaction should NOT include eth transfer from entry point to beneficiary
    const pseudoTransaction = txn!.pseudoTransactions![0];
    expect(pseudoTransaction).toMatchObject({
      from: '0x2991c3845396c9f1d262b2ca0674111a59e2c90a',
      to: '0x5d72015cc621025c265fabffc2fa55ac4821d79f',
      input: '0x',
      value: '5000000000000000',
      assetTransfers: [
        expect.objectContaining({
          type: 'eth',
          from: '0x2991c3845396c9f1d262b2ca0674111a59e2c90a',
          to: '0x5d72015cc621025c265fabffc2fa55ac4821d79f',
          value: '5000000000000000',
        }),
      ],
      netAssetTransfers: {
        '0x2991c3845396c9f1d262b2ca0674111a59e2c90a': expect.objectContaining({
          sent: [
            expect.objectContaining({
              type: 'eth',
              value: '5000000000000000',
            }),
          ],
          received: [],
        }),
        '0x5d72015cc621025c265fabffc2fa55ac4821d79f': expect.objectContaining({
          sent: [],
          received: [
            expect.objectContaining({
              type: 'eth',
              value: '5000000000000000',
            }),
          ],
        }),
      },
    });
  });
});
