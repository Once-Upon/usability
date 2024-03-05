import { KNOWN_ADDRESSES } from './helpers/constants';
import { loadBlockFixture } from './helpers/utils';
import { transformer } from './transformers';

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
          contract: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
          tokenId: '2023617',
          type: 'erc721',
        },
      ]);
    }
  });

  it('should update netAssetTransfers', () => {
    const block = loadBlockFixture('ethereum', 16628971);
    const result = transformer.transform(block);
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

    const cryptoKittiesBlock = loadBlockFixture('ethereum', '18815007_decoded');
    const assetResult = transformer.transform(cryptoKittiesBlock);
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
    const assetResult1 = transformer.transform(cryptoKittiesBlock1);
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

  it('should update assetTransfers for oldNFTs', () => {
    /** CryptoKitties */
    const cryptoKittiesBlock = loadBlockFixture('ethereum', 6082465);
    const cryptoKittiesResult = transformer.transform(cryptoKittiesBlock);
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
    const cryptoStrikersResult = transformer.transform(cryptoStrikersBlock);
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
    const cryptoFightersResult = transformer.transform(cryptoFightersBlock);
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

    const cryptoKittiesBlock2 = loadBlockFixture(
      'ethereum',
      '18815007_decoded',
    );
    const cryptoKittiesResult2 = transformer.transform(cryptoKittiesBlock2);
    const cryptoKittiesTx2 = cryptoKittiesResult2.transactions.find(
      (tx) =>
        tx.hash ===
        '0x76a07f3f822f6235372804b2ffab705a79b89dbe6a15ad086b6879aa97d60321',
    );
    expect(cryptoKittiesTx2).toBeDefined();
    if (cryptoKittiesTx2) {
      const cryptoKittiesTransfers = cryptoKittiesTx2.assetTransfers;
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
    const cryptoKittiesResult1 = transformer.transform(cryptoKittiesBlock1);
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

    /** CryptoPunks New */
    const cryptoPunksNewBlock = loadBlockFixture('ethereum', 5774644);
    const cryptoPunksNewResult = transformer.transform(cryptoPunksNewBlock);
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
    const cryptoPunksOldResult = transformer.transform(cryptoPunksOldBlock);
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

    const cryptoPunksBlock = loadBlockFixture('ethereum', '19321357_decoded');
    const cryptoPunksAssetResult = transformer.transform(cryptoPunksBlock);
    const cryptoPunksTx = cryptoPunksAssetResult.transactions.find(
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

    const cryptoPunksBlock4 = loadBlockFixture('ethereum', '19363120_decoded');
    const cryptoPunksAssetResult4 = transformer.transform(cryptoPunksBlock4);
    const cryptoPunksTx4 = cryptoPunksAssetResult4.transactions.find(
      (tx) =>
        tx.hash ===
        '0x61c6007a23dee8301b7f3e0546ac596087a8496900e0b5a6e1eace3fafc9905d',
    );
    expect(cryptoPunksTx4).toBeDefined();
    if (cryptoPunksTx4) {
      const cryptoPunksTransfers = cryptoPunksTx4.assetTransfers;
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
    const cryptoPunksAssetResult2 = transformer.transform(cryptoPunksBlock2);
    const cryptoPunksTx2 = cryptoPunksAssetResult2.transactions.find(
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

    const cryptoPunksBlock1 = loadBlockFixture('ethereum', '3846659_decoded');
    const cryptoPunksAssetResult1 = transformer.transform(cryptoPunksBlock1);
    const cryptoPunksTx1 = cryptoPunksAssetResult1.transactions.find(
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
