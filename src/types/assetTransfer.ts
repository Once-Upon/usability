import {AssetType} from "./shared"

export type AssetTransfer = {
    asset?: string; // === 'contractAddress'
    burn?: boolean;
    from: string;
    mint?: boolean;
    to: string;
    tokenId?: string;
    value?: string;
    type: AssetType;
};