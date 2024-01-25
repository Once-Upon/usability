import type { RawBlock } from '../types';
import { FORKS } from '../../helpers/constants';

export function transform(block: RawBlock) {
  let fork: string;

  for (const [forkName, forkNumber] of Object.entries(FORKS)) {
    if (block.number >= forkNumber) {
      fork = forkName;
    }
  }

  let minerReward: number;
  if (block.number < FORKS.byzantium) {
    minerReward = 5;
  } else if (block.number < FORKS.constantinople) {
    minerReward = 3;
  } else {
    minerReward = 2;
  }

  return {
    number: block.number,
    fork,
    minerReward,
  };
}
