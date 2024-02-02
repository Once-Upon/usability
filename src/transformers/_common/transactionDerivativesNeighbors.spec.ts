import { transform } from './transactionDerivativesNeighbors';
import { loadBlockFixture } from '../../helpers/utils';

describe('transactionDerivativesNeighbors', () => {
  it('should return derivatives neighbors', () => {
    const testBlock = loadBlockFixture('ethereum', 13533772);
    const testBlockResults = transform(testBlock);

    testBlockResults.forEach((tx) => {
      // TODO - assert here
    });
  });
});
