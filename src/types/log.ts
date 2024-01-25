import {StdObj} from "./shared"

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