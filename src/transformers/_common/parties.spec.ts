import { transform } from './parties';
import { loadBlockFixture } from '../../helpers/utils';

describe('transactionParties', () => {
  it('should return transaction parties', () => {
    const block = loadBlockFixture('ethereum', '17686037_decode');
    const result = transform(block);

    const txResult = result.transactions.find(
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
      ]);
    }

    //The addresses sending/receiving in the assetTransfers should be in parties as well
    const block1 = loadBlockFixture('ethereum', '6088920_decode');
    const result1 = transform(block1);

    const txResult1 = result1.transactions.find(
      (tx) =>
        tx.hash ===
        '0x3ede752dffb235fe8e45e5c5c3cd2d025acd1a5255b3a8fd63ccf7ed7ed55115',
    );
    expect(txResult1).toBeDefined();
    if (txResult1) {
      expect(txResult1.parties.length).toBe(302);
    }

    //NFT should be in parties
    const block2 = loadBlockFixture('ethereum', '18230275_decode');
    const result2 = transform(block2);

    const txResult2 = result2.transactions.find(
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
    const block3 = loadBlockFixture('zora_sepolia', '479884_decode');
    const result3 = transform(block3);
    const txResult3 = result3.transactions.find(
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
    const block4 = loadBlockFixture('lyra_sepolia', '3967804_decode');
    const result4 = transform(block4);

    const txResult4 = result4.transactions.find(
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
    // erc20 tokens should not be in parties
    const block5 = loadBlockFixture('ethereum', '19149188');
    const result5 = transform(block5);

    const txResult5 = result5.transactions.find(
      (tx) =>
        tx.hash ===
        '0xfb62665dd247906395ece8d563acd41a0072db658dbeeb875390fef23541e1aa',
    );
    expect(txResult5).toBeDefined();
    if (txResult5) {
      expect(txResult5.parties).toStrictEqual([
        '0x74b78e98093f5b522a7ebdac3b994641ca7c2b20',
        '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
        '0x44a6999ec971cfca458aff25a808f272f6d492a2',
        '0xb131f4a55907b10d1f0a50d8ab8fa09ec342cd74',
        '0x22f9dcf4647084d6c31b2765f6910cd85c178c18',
        '0x2fd08c1f9fc8406c1d7e3a799a13883a7e7949f0',
        '0x5ebac8dbfbba22168471b0f914131d1976536a25',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xb2bc06a4efb20fc6553a69dbfa49b7be938034a7',
        '0x8146cbbe327364b13d0699f2ced39c637f92501a',
        '0x43a2a720cd0911690c248075f4a29a5e7716f758',
        '0x818a4a855bfeb16c305cb65e8d4fb239a308bc48',
        '0xea500d073652336a58846ada15c25f2c6d2d241f',
      ]);
    }
  });
});
