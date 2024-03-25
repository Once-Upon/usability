import { StdObj } from './shared';

export type LogDescription = {
  signature: string;
  signature_with_arg_names: string;
  name: string;
  decoded: Array<{
    indexed?: boolean;
    name: string;
    type: string;
    decoded: string;
  }>;
};

export type RawLog = StdObj & {
  address: string;
  data: string;
  logIndex: number;
  topics: string[];
  decoded?: LogDescription;
};

export type RawReceipt = StdObj & {
  status: number;
  logs: RawLog[];
  gasUsed: number | string;
  effectiveGasPrice: number | string;
  l1GasPrice?: string;
  l1GasUsed?: string;
  l1FeeScalar?: string;
};

export type EventLogTopics = [
  signature: `0x${string}`,
  ...args: `0x${string}`[],
];
