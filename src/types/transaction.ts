import { StdObj } from './shared';
import { AssetTransfer, NetAssetTransfers } from './asset';
import { RawReceipt } from './log';
import { Contract } from './contract';

export type RawTransaction = StdObj & {
  accessList?: StdObj[];
  blockNumber: number;
  from: string;
  hash: string;
  input: string;
  value: string;
  receipt: RawReceipt;
  gasPrice: string;
  to: string;
  traces: RawTrace[];
  contracts?: Contract[];
  decoded?: TransactionDescription;
  context: TxContext;
  assetTransfers: AssetTransfer[];
  netAssetTransfers: NetAssetTransfers;
  errors: string[];
  parties: string[];
};

export type RawTraceAction = StdObj & {
  address: string;
  balance?: string;
  callType?: string;
  from: string;
  refundAddress?: string;
  to?: string;
  value?: string;
  input?: string;
};

export type RawTraceResult = StdObj & {
  address?: string;
  code: string;
  hash: string;
  receipt: StdObj;
  to: string;
  traces: RawTrace[];
  transactionIndex: number;
};

export type RawTrace = StdObj & {
  action: RawTraceAction;
  blockNumber: number;
  blockhash: string;
  error?: string;
  result: RawTraceResult;
  subtraces: number;
  traceAddress: number[];
  transactionHash: string;
  transactionPosition: number;
  type: string;
  decoded?: TransactionDescription;
};

export type TransactionDescription = {
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

export type TxContext = {
  type: string;
};
