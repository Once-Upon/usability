import { StdObj, FragmentType, ParamType } from './shared';
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
  to: string;
  traces: RawTrace[];
  contracts?: Contract[];
  decode?: TransactionDescription;
  context: TxContext;
  assetTransfers: AssetTransfer[];
  netAssetTransfers: NetAssetTransfers;
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
  decode?: TransactionDescription;
};

export type TransactionDescription = {
  fragment: {
    name: string;
    type: FragmentType;
    inputs: ReadonlyArray<ParamType>;
    outputs: ReadonlyArray<ParamType>;
    constant: boolean;
    stateMutability: 'payable' | 'nonpayable' | 'view' | 'pure';
    payable: boolean;
    gas: null | string;
  };
  name: string;
  args: string[];
  signature: string;
  selector: string;
  value: string;
};

export type TxContext = {
  type: string;
};
