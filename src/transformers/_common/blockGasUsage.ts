import { toBigNumber } from '../helpers/utils';
import type { RawBlock } from '../types';

export function transform(block: RawBlock) {
  const gasUsedPercentage = toBigNumber(block.gasUsed)
    .multipliedBy(100)
    .dividedBy(toBigNumber(block.gasLimit))
    .toString();

  return {
    number: block.number,
    gasUsedPercentage,
  };
}
