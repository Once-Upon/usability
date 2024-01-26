import type { RawBlock } from '../../types';

export function transform(block: RawBlock) {
  const gasUsedPercentage =
    (BigInt(block.gasUsed) * BigInt(100)) / BigInt(block.gasLimit);

  return {
    number: block.number,
    gasUsedPercentage: gasUsedPercentage.toString(),
  };
}
