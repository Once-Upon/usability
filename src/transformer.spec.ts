import { loadBlockFixture } from './helpers/utils';
import { KNOWN_ADDRESSES } from './helpers/constants';
import { transform as transactionNetAssetTransferTransform } from './transformers/_common/transactionAssetTransfers';
import { transform as transactionContractsCreatedTransform } from './transformers/_common/transactionContractsCreated';
import { transform as transactionDelegateCallsTransform } from './transformers/_common/transactionDelegateCalls';
import { transform as transactionDerivativesNeighborsTransform } from './transformers/_common/transactionDerivativesNeighbors';
import { transform as transactionErrorsTransform } from './transformers/_common/transactionErrors';
import { transform as transactionNetAssetTransfersTransform } from './transformers/_common/transactionNetAssetTransfers';
import { transform as transactionPartiesTransform } from './transformers/_common/transactionParties';
import { transform as transactionSigHashTransform } from './transformers/_common/transactionSigHash';
import { transform as transactionTimestampTransform } from './transformers/_common/transactionTimestamp';

describe('transformations', () => {
  it('TransactionAssetTransfers', () => {
    const wethBlock = loadBlockFixture('ethereum', 10743414);
    const wethResult = transactionNetAssetTransferTransform(wethBlock);

    // testing direct ETH transfer in tx: https://www.onceupon.gg/finder/0x9e7654743c06585d5754ee9cfd087b50f431484d53a757d57d5b51144e51bc95
    const ethTx = wethResult.find(
      (wr) =>
        wr.hash ===
        '0x9e7654743c06585d5754ee9cfd087b50f431484d53a757d57d5b51144e51bc95',
    );
    expect(ethTx).toBeDefined();
    if (ethTx) {
      const ethTransfers = ethTx.assetTransfers;
      expect(ethTransfers.length).toBe(1);
      expect(ethTransfers[0].type).toBe('eth');
      if ('value' in ethTransfers[0]) {
        expect(ethTransfers?.[0].value).toBe('3000000000000000000');
      }
    }

    // testing deposit in tx: https://www.onceupon.gg/finder/0x020b4772754a0caf0512c43da6275d6f8c9000f3915850639f799a254d70bccb
    const wethDepositTx = wethResult.find(
      (wr) =>
        wr.hash ===
        '0x020b4772754a0caf0512c43da6275d6f8c9000f3915850639f799a254d70bccb',
    );
    expect(wethDepositTx).toBeDefined();
    if (wethDepositTx) {
      const wethDepositTransfers = wethDepositTx.assetTransfers.filter(
        (t) => 'asset' in t && t.asset === KNOWN_ADDRESSES.WETH,
      );
      const ethDepositTransfers = wethDepositTx.assetTransfers.filter(
        (t) => t.type === 'eth',
      );
      expect(wethDepositTransfers.length).toBe(2);
      expect(ethDepositTransfers.length).toBe(2);
      expect(
        wethDepositTransfers.map((t) => 'value' in t && t.value),
      ).toStrictEqual(['849340000000000000', '849340000000000000']);
      expect(
        ethDepositTransfers.map((t) => 'value' in t && t.value),
      ).toStrictEqual(['849340000000000000', '939779139036474196']);
      expect(wethDepositTransfers[0].from).toBe(KNOWN_ADDRESSES.NULL);
    }

    // testing withdrawal in tx: https://www.onceupon.gg/finder/0x2496fa85b6046f44b0ae0ee6315db0757cad9f7c0c9fdb17a807169937bc3870
    const wethWithdrawalTx = wethResult.find(
      (wr) =>
        wr.hash ===
        '0x2496fa85b6046f44b0ae0ee6315db0757cad9f7c0c9fdb17a807169937bc3870',
    );
    expect(wethWithdrawalTx).toBeDefined();
    if (wethWithdrawalTx) {
      const wethWithdrawalTransfers = wethWithdrawalTx.assetTransfers.filter(
        (t) => 'asset' in t && t.asset === KNOWN_ADDRESSES.WETH,
      );
      const ethWithdrawalTransfers = wethWithdrawalTx.assetTransfers.filter(
        (t) => t.type === 'eth',
      );
      expect(wethWithdrawalTransfers.length).toBe(2);
      expect(ethWithdrawalTransfers.length).toBe(2);
      expect(
        wethWithdrawalTransfers
          .concat(ethWithdrawalTransfers)
          .map((t) => 'value' in t && t.value),
      ).toStrictEqual([
        '744938100770972576',
        '744938100770972576',
        '744938100770972576',
        '744938100770972576',
      ]);
      expect(wethWithdrawalTransfers[1].to).toBe(KNOWN_ADDRESSES.NULL);
    }

    // Self destructed contract refunds in tx: https://www.onceupon.gg/finder/0x7899aabe7417de87d1c4c28c320d7c6781021cee2b11bfb81440132d4413ee87
    const refundBlock = loadBlockFixture('ethereum', 15107468);
    const refundResult = transactionNetAssetTransferTransform(refundBlock);
    const refundTx = refundResult.find(
      (rr) =>
        rr.hash ===
        '0x7899aabe7417de87d1c4c28c320d7c6781021cee2b11bfb81440132d4413ee87',
    );
    expect(refundTx).toBeDefined();
    if (refundTx) {
      const refundTransfers = refundTx.assetTransfers;
      expect(refundTransfers.length).toBe(3);
      expect(refundTransfers.map((t) => 'value' in t && t.value)).toStrictEqual(
        ['1588213925000000000', '1588213925000000000', '1588213925000000000'],
      );
    }

    // Sorted combo transfers
    const sortedComboBlock = loadBlockFixture('ethereum', 16628971);
    const comboTx = transactionNetAssetTransferTransform(sortedComboBlock).find(
      (tx) =>
        tx.hash ===
        '0xd175f7d3e34f46e68a036fcccb8abbd3610095e753bd64f50586e4ec51e94167',
    );
    expect(comboTx).toBeDefined();
    if (comboTx) {
      const comboTransfers = comboTx.assetTransfers;
      expect(comboTransfers.length).toBe(5);
      expect(comboTransfers.map((t) => t.type)).toStrictEqual([
        'erc20',
        'erc20',
        'erc20',
        'eth',
        'eth',
      ]);
    }
  });

  it('TransactionContractsCreated', () => {
    const block = loadBlockFixture('ethereum', 14918216);
    const result = transactionContractsCreatedTransform(block);

    expect(
      block.transactions.filter((tx) => !!tx.receipt.contractAddress).length,
    ).toBe(1);

    // first check on contracts created
    const contractedCreated = result.map((tx) => tx.contracts).flat();
    expect(contractedCreated.length).toBe(5);
    expect(contractedCreated.every((c) => !!c.address)).toBe(true);
    expect(
      contractedCreated
        .slice(0, 4)
        .every((c) => c.deployer !== c.directDeployer),
    ).toBe(true);
    expect(
      contractedCreated.slice(4).every((c) => c.deployer === c.directDeployer),
    ).toBe(true);
  });

  it('transactionDelegateCalls', () => {
    const block = loadBlockFixture('ethereum', 14573289);
    const result = transactionDelegateCallsTransform(block);

    const resultTxHashes = result.map((r) => r.hash);

    for (const tx of block.transactions) {
      const idx = resultTxHashes.indexOf(tx.hash);
      if (idx < 0) {
        continue;
      }

      expect(result[idx].delegateCalls).toStrictEqual(
        tx.traces.filter((t) => t.action.callType === 'delegatecall'),
      );
    }
  });

  it('transactionDerivativesNeighbors', () => {
    const testBlock = loadBlockFixture('ethereum', 13533772);
    const testBlockResults =
      transactionDerivativesNeighborsTransform(testBlock);

    testBlockResults.forEach((tx) => {
      // TODO - assert here
    });
  });

  it('transactionErrors', () => {
    const block = loadBlockFixture('ethereum', 14918216);
    const result = transactionErrorsTransform(block);

    const errors = result.map((tx) => tx.errors).flat();
    expect(errors.length).toBe(6);
    expect(errors.every((e) => e.length > 0)).toBe(true);
  });

  it('transactionNetAssetTransfers', () => {
    const block = loadBlockFixture('ethereum', 16628971);
    const result = transactionNetAssetTransfersTransform(block);
    console.log('result', result);
    const comboTx = result.find(
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
          asset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          tokenId: undefined,
          type: 'erc20',
          value: '1813694121453461568',
        },
      ]);
    }
  });

  it('transactionParties', () => {
    const block = loadBlockFixture('ethereum', 17686037);
    const result = transactionPartiesTransform(block);

    const txResult = result.find(
      (tx) =>
        tx.hash ===
        '0x900b1e7aa62740763448008840ac878886a34907395ae140a4f52e09bf3446cc',
    );
    expect(txResult).toBeDefined();
    if (txResult) {
      expect(txResult.parties).toStrictEqual([
        '0x16cac4f493db73c12ff9febbf794be4a31dc865d',
        '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
        '0x08fb1aa2dbb2ef9cd930485c0ec84eddbea1851f',
        '0x2b888954421b424c5d3d9ce9bb67c9bd47537d12',
        '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72-1910013010224751428410',
      ]);
    }

    //The addresses sending/receiving in the assetTransfers should be in parties as well
    const block1 = loadBlockFixture('ethereum', 6088920);
    const result1 = transactionPartiesTransform(block1);

    const txResult1 = result1.find(
      (tx) =>
        tx.hash ===
        '0x3ede752dffb235fe8e45e5c5c3cd2d025acd1a5255b3a8fd63ccf7ed7ed55115',
    );
    expect(txResult1).toBeDefined();
    if (txResult1) {
      expect(txResult1.parties.length).toBe(303);
    }

    //NFT should be in parties
    const block2 = loadBlockFixture('ethereum', 18230275);
    const result2 = transactionPartiesTransform(block2);

    const txResult2 = result2.find(
      (tx) =>
        tx.hash ===
        '0xece119678a421a7e4c4af38848ef84634028fce2b17720a565136f13e7881db6',
    );
    expect(txResult2).toBeDefined();
    if (txResult2) {
      expect(txResult2.parties).toStrictEqual([
        '0xd7029bdea1c17493893aafe29aad69ef892b8ff2',
        '0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7',
        '0x0000000000000000000000000000000000000000',
        '0x8fc5d6afe572fefc4ec153587b63ce543f6fa2ea',
        '0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7-6605',
      ]);
    }

    // Zora Sepolia
    const block3 = loadBlockFixture('zora_sepolia', 479884);
    const result3 = transactionPartiesTransform(block3);
    const txResult3 = result3.find(
      (tx) =>
        tx.hash ===
        '0xd9deb98a359b71243f74939985be840f54c658e23d4d81bc44003088ec28df29',
    );
    expect(txResult3).toBeDefined();
    if (txResult3) {
      expect(txResult3.parties).toStrictEqual([
        '0xfe44ae787a632c45acea658492ddbebe39f002ac',
        '0xf21d42203af9af1c86e1e8ac501b41f5bc004a0a',
        '0xf0b44c112630b2423c03080740d1a612474fc12a',
        '0x9da2873b5ffe73d3ba353111920534f30076cbb4',
        '0x0000000000000000000000000000000000000001',
        '0x101707a0ba5f2eb87336994c2e8b9eb39b0cf20c',
        '0x6e07bbf7fba8e43988aec5f2df6c40d1afb4400e',
      ]);
    }

    // Lyra Sepolia
    const block4 = loadBlockFixture('lyra_sepolia', 3967804);
    const result4 = transactionPartiesTransform(block4);

    const txResult4 = result4.find(
      (tx) =>
        tx.hash ===
        '0xfa58c800fbdc2f34312a6bed8fc8e5052ce59f26a2258a0930529efbcda21ceb',
    );
    expect(txResult4).toBeDefined();
    if (txResult4) {
      expect(txResult4.parties).toStrictEqual([
        '0xfe44ae787a632c45acea658492ddbebe39f002ac',
        '0xf21d42203af9af1c86e1e8ac501b41f5bc004a0a',
        '0xf0b44c112630b2423c03080740d1a612474fc12a',
        '0x9da2873b5ffe73d3ba353111920534f30076cbb4',
        '0x0000000000000000000000000000000000000001',
        '0x6bf249f802b9afc6d10af75eb45d4559858c81a1',
        '0x6e07bbf7fba8e43988aec5f2df6c40d1afb4400e',
      ]);
    }
  });

  it('transactionSigHash', () => {
    const block = loadBlockFixture('ethereum', 13142655);
    const result = transactionSigHashTransform(block);

    const txResult = result.find(
      (tx) =>
        tx.hash ===
        '0x044b142b9ef202512e24f233fbc0b87033dfa772ed74aeebaad4a9a3ea41c38a',
    );
    expect(txResult).toBeDefined();
    if (txResult) {
      expect(txResult.sigHash).toBe('0xaf182255');
      expect(txResult.internalSigHashes).toStrictEqual([
        {
          from: '0x4cdf3d8b92fdde2fcdf7de29ee38fca4be90eed0',
          to: '0x2e956ed3d7337f4ed4316a6e8f2edf74bf84bb54',
          sigHash: '0xaf182255',
        },
        {
          from: '0x2e956ed3d7337f4ed4316a6e8f2edf74bf84bb54',
          to: '0x2252d401ec9d16065069529b053b105fe42e0176',
          sigHash: '0x70a08231',
        },
        {
          from: '0x2e956ed3d7337f4ed4316a6e8f2edf74bf84bb54',
          to: '0x2252d401ec9d16065069529b053b105fe42e0176',
          sigHash: '0x2f745c59',
        },
        {
          from: '0x2e956ed3d7337f4ed4316a6e8f2edf74bf84bb54',
          to: '0x2252d401ec9d16065069529b053b105fe42e0176',
          sigHash: '0x2f745c59',
        },
        {
          from: '0x2e956ed3d7337f4ed4316a6e8f2edf74bf84bb54',
          to: '0x2252d401ec9d16065069529b053b105fe42e0176',
          sigHash: '0x2f745c59',
        },
      ]);
    }
  });

  it('transactionTimestamp', () => {
    const block = loadBlockFixture('ethereum', 14573289);
    const result = transactionTimestampTransform(block);

    for (let i = 0; i < block.transactions.length; i += 1) {
      expect(result[i].timestamp).toBe(block.timestamp);
      expect(result[i].isoTimestamp).toBe(
        new Date(block.timestamp * 1000).toISOString(),
      );
    }
  });
});
