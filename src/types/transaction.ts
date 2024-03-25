import { Hex } from 'viem';
import { InternalHashType, StdObj } from './shared';
import { AssetTransfer, NetAssetTransfers } from './asset';
import { RawLog, RawReceipt } from './log';
import { Contract } from './contract';

export type PartialReceipt = Partial<RawReceipt> & { logs: RawLog[] };

export type PartialTransaction = {
  blockNumber: Hex;
  chainId: Hex;
  from: Hex;
  hash: Hex;
  input: Hex;
  value: Hex;
  receipt: PartialReceipt;
  gasPrice: Hex;
  to: Hex;

  contracts?: Contract[];
  decoded?: TransactionDescription;
  context: TxContext;
  assetTransfers: AssetTransfer[];
  netAssetTransfers: NetAssetTransfers;
  errors: string[];
  parties: string[];

  // NOTE: inconsistent with Neighbor definition in types/neighbor
  neighbor?: { address: string; neighbor: string };

  sigHash?: string;
  internalSigHashes?: InternalHashType[];
  timestamp?: number;

  baseFeePerGas?: string | number;
  transactionFee?: string;
};

export type RawTransaction = StdObj & PartialTransaction & {
  accessList?: StdObj[];
  receipt: RawReceipt;
  pseudoTransactions?: PseudoTransaction[];
  traces: RawTrace[];
  delegateCalls?: RawTrace[];
};

export type PseudoTransaction = StdObj & PartialTransaction;

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
