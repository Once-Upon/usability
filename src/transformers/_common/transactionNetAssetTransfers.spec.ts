import { transform } from './transactionNetAssetTransfers';
import { loadBlockFixture } from '../../helpers/utils';
import { KNOWN_ADDRESSES } from '../../helpers/constants';

describe('transactionNetAssetTransfers', () => {
  it('should return net asset transfers', () => {
    const block = loadBlockFixture('ethereum', 16628971);
    const result = transform(block);
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
});
