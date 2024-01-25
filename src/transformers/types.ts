// import { ethers } from 'ethers';
export type StdObj = Record<string, unknown>;

// INTERFACES

export type Config = {
  async: boolean;
  chains?: string[];
  checkMethod?: string;
  method: string;
  outputModel: 'block' | 'transaction';
  outputSource: 'json';
  phaseName: string;
  rateLimit?: number; // measured in requests per second
  sourcePhase: string;
};


// PAYLOAD TYPES

export type AssetTransfer = {
  asset?: string; // === 'contractAddress'
  burn?: boolean;
  from: string;
  mint?: boolean;
  to: string;
  tokenId?: string;
  value?: string;
  type: 'erc20' | 'erc721' | 'erc1155' | 'eth';
};

export type NetAssetTransfer = {
  asset: string;
  from?: string;
  to?: string;
  id: string;
  tokenId?: string;
  type: AssetTransfer['type'];
  value: string;
};

export type NetAssetTransfers = Record<string, { received: NetAssetTransfer[]; sent: NetAssetTransfer[] }>;

export type RawBlock = StdObj & {
  chainId?: number;
  number: number;
  timestamp: number;
  transactions: RawTransaction[];
};

export type RawLog = StdObj & {
  address: string;
  data: string;
  logIndex: number;
  topics: string[];
  decode?: LogDescription;
};

export type RawReceipt = StdObj & {
  logs: RawLog[];
};

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

export type SupportedInterfaces = Record<string, boolean>;

export type ContractMetadata = {
  isUniswapV3: boolean;
  isUniswapV2: boolean;
  isUniswapV1: boolean;
  uniswapPairs: string[];
  isPropHouseToken: boolean;
  isPropHouseMetadata: boolean;
  isPropHouseAuction: boolean;
  isPropHouseTreasury: boolean;
  isPropHouseGovernor: boolean;
  isGenericGovernance: boolean;
  isGnosisSafe: boolean;

  alchemy?: StdObj;
  coingecko?: StdObj;
  etherscan?: StdObj;
  opensea?: StdObj;
  simplehash?: StdObj;
  tally?: TallyMetadata;
  whatsAbiSelectors: string[];
  // whatsAbiAbi: ethers.InterfaceAbi;
  isProxy: boolean;
  implementationAddress?: string;
  tokenMetadata?: TokenMetadata;
};

export type UniswapPair = {
  address: string;
  tokens: string[];
};

export type Contract = {
  chainId?: number;
  deployer: string;
  directDeployer: string;
  address: string;
  bytecode: string;
  fingerprint: string;
  gas: unknown; // TOOD - do we convert with bignumber here?
  gasUsed: unknown; // TODO - do we convert with bignumber here?
  blockNumber: number;
  transactionHash: string;
  type: 'create' | 'create2';
  metadata?: ContractMetadata;
  supportedInterfaces?: SupportedInterfaces;
  sigHash: string;
  internalSigHashes: string[];
  transactionIndex: number;
  traceIndex: number;
  ethTransfer: boolean;
  timestamp: number;
  isoTimestamp: string;
};

export type TokenStandard = 'erc20' | 'erc721' | 'erc777' | 'erc1155' | '';

export type TokenMetadata = {
  tokenStandard: TokenStandard;
  name?: string;
  symbol?: string;
  decimals?: number;
};

/** ABI */

export type AbiType = 'function' | 'constructor' | 'event' | 'fallback' | 'receive';
export type StateMutabilityType = 'pure' | 'view' | 'nonpayable' | 'payable';

export interface AbiItem {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: AbiInput[];
  name?: string;
  outputs?: AbiOutput[];
  payable?: boolean;
  stateMutability?: StateMutabilityType;
  type: AbiType;
  gas?: number;
}

export interface AbiInput {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiInput[];
  internalType?: string;
}

export interface AbiOutput {
  name: string;
  type: string;
  components?: AbiOutput[];
  internalType?: string;
}

export type TransactionContract = {
  hash: string;
  contracts: Contract[];
};

export type transactionAssetTransfers = {
  hash: string;
  assetTransfers: AssetTransfer[];
};

export type InternalHashType = {
  sigHash: string;
  from: string;
  to: string;
};

export type TransactionWithHash = {
  hash: string;
  sigHash: string;
  internalSigHashes: InternalHashType[];
};

export type TransactionDescription = {
  fragment: {
    name: string;
    // type: ethers.FragmentType;
    // inputs: ReadonlyArray<ethers.ParamType>;
    // outputs: ReadonlyArray<ethers.ParamType>;
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

export type LogDescription = {
  fragment: {
    name: string;
    // type: ethers.FragmentType;
    // inputs: ReadonlyArray<ethers.ParamType>;
    anonymous: boolean;
  };
  name: string;
  signature: string;
  args: string[];
  topic: string;
};

export type DecodeStatistics = {
  totalLogs: number;
  parsedLogs: number;
  totalTraces: number;
  parsedTraces: number;
  isParsed: boolean;
};

export type TransactionDecode = {
  hash: string;
  decode?: TransactionDescription;
  receipt?: RawReceipt;
  traces?: RawTrace[];
};

export type TransactionWithIDM = {
  hash: string;
  idm: boolean;
};

export type PropHouseDao = {
  token: string;
  metadata: string;
  auction: string;
  treasury: string;
  governor: string;
};

export type TallyGovernorAPIResponse = {
  data: {
    governors: TallyMetadata[];
  };
};

export type TallyMetadata = {
  type: string;
  name: string;
  quorum: string;
  timelockId: string;
  parameters: {
    quorumVotes: string;
    proposalThreshold: string;
    votingDelay: string;
    votingPeriod: string;
    quorumNumerator: string;
    quorumDenominator: string;
  };
  proposalStats: {
    total: number;
    active: number;
    failed: number;
    passed: number;
  };
  tokens: [
    {
      id: string;
      type: string;
      address: string;
      name: string;
      symbol: string;
      supply: string;
      lastBlock: number;
      decimals: number;
    }
  ];
  slug: string;
};

export type AddressInteractedWith = {
  hash: string;
  addressInteractedWith: {
    address: string;
    interactedWith: string;
  };
};

export type AddressesPartiedWith = {
  hash: string;
  addressesPartiedWith: {
    address: string;
    interactedWith: string;
  }[];
};

export type Neighbor = {
  hash: string;
  neighbor: {
    address: string;
    neighbor: string;
  };
};

export type TransactionWithContext = {
  hash: string;
  context: TxContext;
};

export type TxContextValueType = {
  type: string;
  value: string;
};

export type TxContext = {
  type: string;
};

export type TransactionDecodeGnosisSafe = {
  hash: string;
  decodeGnosis?: GnosisSafeDecode;
};

export type GnosisSafeDecode = {
  target: string;
  data: string;
  decode: TransactionDescription;
};
