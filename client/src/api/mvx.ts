import { getApiUrl } from "@/contracts/config";

export interface ApiNftMedia {
    url: string;
    originalUrl: string;
    thumbnailUrl: string;
    fileType: string;
    fileSize: number;
}

export interface ApiNftMetadata {
    description: string;
}

export interface ApiNft {
    identifier: string;
    collection: string;
    attributes: string;
    nonce: number;
    type: string;
    subType: string;
    name: string;
    creator: string;
    royalties: number;
    uris: string[];
    url: string;
    media: ApiNftMedia[];
    isWhitelistedStorage: boolean;
    tags: string[];
    metadata: ApiNftMetadata;
    balance: string;
    ticker: string;
}

export const getAccountNfts = async (address: string): Promise<ApiNft[]> => {
    const response = await fetch(`${getApiUrl()}/accounts/${address}/nfts`);
    if (!response.ok) {
        throw new Error("Failed to fetch NFTs");
    }
    return response.json();
}