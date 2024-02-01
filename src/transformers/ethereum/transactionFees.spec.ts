import { transform } from './transactionFees';
import { loadBlockFixture } from '../../helpers/utils';

describe('transactionFees', () => {
  it('should return transaction fees', () => {
    // first test pre-London hardfork
    const preLondonBlock = loadBlockFixture('ethereum', 12500000);
    const preResult = transform(preLondonBlock);
    for (const tx of preResult) {
      expect(tx.baseFeePerGas).toBe(preLondonBlock.baseFeePerGas);
      expect(tx.burntFees).toBe('0');
      expect(tx.minerFees).toBe(tx.transactionFee);
    }

    // and then test after
    const postLondonBlock = loadBlockFixture('ethereum', 14573289);
    const postResult = transform(postLondonBlock);
    for (const tx of postResult) {
      expect(tx.baseFeePerGas).toBe(postLondonBlock.baseFeePerGas);
    }
    const postTx = postResult.find(
      (tx) =>
        tx.hash ===
        '0x942e0ff43a8716ee324bef63c346a045839c44ccee15e49519726e6ba4ba3984',
    );
    expect(postTx).toBeDefined();
    if (postTx) {
      expect(postTx.burntFees).toBe('2557275674640775');
      expect(postTx.minerFees).toBe('1693575757203250');
    }
  });
});
