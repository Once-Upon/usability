import { transform } from './parties';
import { loadBlockFixture } from '../../helpers/utils';

describe('transactionParties', () => {
  it('should return transaction parties', () => {
    const block = loadBlockFixture('ethereum', '12679108_decoded');
    const result = transform(block);

    const txResult1 = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0xf677a8d48d456fc124b3097ccb7e35171b5f8c048f4682ae1566da828bca4480',
    );
    expect(txResult1).toBeDefined();
    if (txResult1) {
      expect(txResult1.parties).toStrictEqual([
        '0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98',
        '0xfc1e1fd1d25d915c7eae1ece7112eb141dca540d',
        '0xa3c1e324ca1ce40db73ed6026c4a177f099b5770',
        '0xb2233fcec42c588ee71a594d9a25aa695345426c',
        '0xc0f874d652cd46ad233971fc61008309778730dd',
        '0x0000000000000000000000000000000000000000',
      ]);
    }

    const txResult2 = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0xfa58c800fbdc2f34312a6bed8fc8e5052ce59f26a2258a0930529efbcda21ceb',
    );
    expect(txResult2).toBeDefined();
    if (txResult2) {
      expect(txResult2.parties).toStrictEqual([
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
