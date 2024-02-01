import { loadBlockFixture } from './helpers/utils';
import { transformer } from './transformers';

describe('transformations', () => {
  it('should return asset transfers', () => {
    const wethBlock = loadBlockFixture('ethereum', 10743414);
    const wethResult = transformer.transform(wethBlock);

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
  });
});
