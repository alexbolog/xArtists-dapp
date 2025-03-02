import { getApiUrl } from "@/contracts/config";

export interface ApiNftMedia {
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileType: string;
  fileSize: number;
}

export interface ApiNftMetadata {
  title?: string;
  attributes?: NftAttribute[];
  description?: string;
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
  unstakingTimestamp?: number;
}

export const getAccountNfts = async (
  address: string,
  identifiers?: string[],
  size?: number
): Promise<ApiNft[]> => {
  let requestUrl = `${getApiUrl()}/accounts/${address}/nfts?size=${
    size ?? 10000
  }`;
  if (identifiers) {
    requestUrl += `&identifiers=${identifiers.join(",")}`;
  }
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch NFTs");
  }
  return response.json();
};

export const getCollectionNfts = async (
  collection: string
): Promise<ApiNft[]> => {
  let requestUrl = `${getApiUrl()}/collections/${collection}/nfts?size=10000`;
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch NFTs");
  }
  return response.json();
};

export const getNftById = async (identifier: string): Promise<ApiNft> => {
  let response = await fetch(`${getApiUrl()}/nfts/${identifier}`);
  if (!response.ok) {
    throw new Error("Failed to fetch NFT");
  }
  const nft = await response.json();
  nft.metadata = await getValidMetadata(nft);
  console.log("NFT", nft);
  return nft;
};

const getValidMetadata = async (nft: ApiNft) => {
  try {
    const metadataCid = Buffer.from(nft.attributes, "base64")
      .toString("utf-8")
      .split(";")
      .filter((attr) => attr.startsWith("metadata"))[0]
      .split(":")[1];
    const metadataJsonUri = `https://ipfs.io/ipfs/${metadataCid}`;
    const metadataJson = await fetch(metadataJsonUri).then((res) => res.json());
    return metadataJson;
  } catch (err) {
    console.warn(`Failed to fetch metadata for NFT ${nft.identifier}`, err);
    return {};
  }
};

export const getTokens = async (identifiers: string[]): Promise<Token[]> => {
  let requestUrl = `${getApiUrl()}/tokens`;
  if (identifiers) {
    requestUrl += `?identifiers=${identifiers.join(",")}`;
  }
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch tokens");
  }
  return response.json();
};

export const getTokenSupply = async (
  identifier: string
): Promise<TokenSupply> => {
  const response = await fetch(`${getApiUrl()}/tokens/${identifier}/supply`);
  if (!response.ok) {
    throw new Error("Failed to fetch token supply");
  }
  return response.json();
};

export interface TokenSupply {
  circulatingSupply: string;
  totalSupply: string;
}

interface TokenAssets {
  website: string;
  description: string;
  status: string;
  pngUrl: string;
  name: string;
  svgUrl: string;
  ledgerSignature: string;
  lockedAccounts: string;
  extraTokens: string[];
  preferredRankAlgorithm: string;
}

interface TokenRole {
  address: string;
  canLocalMint: boolean;
  canLocalBurn: boolean;
  canCreate: boolean;
  canBurn: boolean;
  canAddQuantity: boolean;
  canUpdateAttributes: boolean;
  canAddUri: boolean;
  canTransfer: boolean;
  roles: string[];
}

interface Token {
  type: string;
  subType: string;
  identifier: string;
  collection: string;
  nonce: number;
  name: string;
  ticker: string;
  owner: string;
  minted: string;
  burnt: string;
  initialMinted: string;
  decimals: number;
  isPaused: boolean;
  assets: TokenAssets;
  transactions: number;
  transactionsLastUpdatedAt: number;
  transfers: number;
  transfersLastUpdatedAt: number;
  accounts: number;
  accountsLastUpdatedAt: number;
  canUpgrade: boolean;
  canMint: boolean;
  canBurn: boolean;
  canChangeOwner: boolean;
  canAddSpecialRoles: boolean;
  canPause: boolean;
  canFreeze: boolean;
  canWipe: boolean;
  canTransferNftCreateRole: boolean;
  price: number;
  marketCap: number;
  supply: string;
  circulatingSupply: string;
  timestamp: number;
  mexPairType: string;
  totalLiquidity: number;
  totalVolume24h: number;
  isLowLiquidity: boolean;
  lowLiquidityThresholdPercent: number;
  tradesCount: number;
  ownersHistory: Record<string, unknown>;
  roles: TokenRole[];
  canTransfer: boolean;
}

export interface PhysicalAssetDetails {
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  medium?: string;
  surface?: string;
  material?: string;
  technique?: string;
  baseIncluded?: boolean;
}

export interface NftAttribute {
  trait_type: string;
  value: string;
}

export interface AiAnalysis {
  styleRecognition?: string;
  colorPalette?: string;
  composition?: {
    elements?: string;
    balance?: string;
    focus?: string;
    uniqueFeatures?: string;
    [key: string]: string | undefined; // Allow for additional composition fields
  };
  [key: string]: any; // Allow for additional top-level AI analysis fields
}
