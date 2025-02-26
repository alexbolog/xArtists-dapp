// ... existing code ...

import { Artwork } from "@shared/schema";
import {
  AiAnalysis,
  ApiNft,
  ApiNftMetadata,
  NftAttribute,
  PhysicalAssetDetails,
} from "./api/mvx";

function getAttributeValue(
  attributes: NftAttribute[] | undefined,
  traitType: string
): string | undefined {
  return attributes?.find((attr) => attr.trait_type === traitType)?.value;
}

export function mapNftToArtwork(nft: ApiNft, price?: string): Artwork {
  // Parse the metadata which might be in the attributes field
  let metadata: ApiNftMetadata = nft.metadata || {};

  try {
    // Try to parse metadata from attributes or URIs
    if (nft.attributes) {
      const metadataUri = nft.uris?.[1];
      if (metadataUri) {
        const decodedMetadata = JSON.parse(atob(metadataUri));
        if (decodedMetadata) {
          metadata = { ...metadata, ...decodedMetadata };
        }
      }
    }
  } catch (e) {
    console.warn("Failed to parse NFT metadata", e);
  }

  const attributes = metadata.attributes || [];

  // Get artwork type (lowercase and cleaned)
  const artworkType =
    getAttributeValue(attributes, "type")?.toLowerCase()?.trim() || "digital";

  // Extract physical asset details based on artwork type
  let physicalAssetDetails: PhysicalAssetDetails | undefined;

  if (artworkType === "painting" || artworkType === "sculpture") {
    physicalAssetDetails = {
      width: parseFloat(getAttributeValue(attributes, "width") || "0"),
      height: parseFloat(getAttributeValue(attributes, "height") || "0"),
      depth: parseFloat(getAttributeValue(attributes, "depth") || "0"),
      weight: parseFloat(getAttributeValue(attributes, "weight") || "0"),
    };

    // Add painting-specific details
    if (artworkType === "painting") {
      physicalAssetDetails.medium =
        getAttributeValue(attributes, "medium") || undefined;
      physicalAssetDetails.surface =
        getAttributeValue(attributes, "surface") || undefined;
    }

    // Add sculpture-specific details
    if (artworkType === "sculpture") {
      physicalAssetDetails.material =
        getAttributeValue(attributes, "material") || undefined;
      physicalAssetDetails.technique =
        getAttributeValue(attributes, "technique") || undefined;
      const baseIncluded = getAttributeValue(attributes, "baseIncluded");
      if (baseIncluded) {
        physicalAssetDetails.baseIncluded =
          baseIncluded.toLowerCase() === "true";
      }
    }
  }

  // Determine if it has a physical asset
  const hasPhysicalAsset =
    artworkType === "painting" || artworkType === "sculpture";

  return {
    id: nft.nonce,
    title: metadata.title || nft.name || "Untitled",
    description: metadata.description || "",
    imageUrl: nft.url || nft.media?.[0]?.url || "",
    artist: getAttributeValue(attributes, "artist") || "Unknown Artist",
    userId: 0, // Default as this isn't available in NFT data
    mintedNftId: nft.nonce,
    hasPhysicalAsset,
    artworkType,
    physicalAssetDetails: hasPhysicalAsset ? physicalAssetDetails : undefined,
    price: price || null,
    createdAt: new Date(), // TODO: add issuance timestamp to metadata?
    voteCount: 0,
  };
}

export function extractAiAnalysis(nft: ApiNft): AiAnalysis | null {
  try {
    if (!nft.metadata?.attributes) {
      return null;
    }

    const attributes: NftAttribute[] = nft.metadata.attributes;

    // If no AI attributes found, return null
    if (!attributes.some((attr) => attr.trait_type.startsWith("xArtistsAI_"))) {
      return null;
    }

    // Get all AI-related attributes
    const aiAttributes = attributes.filter((attr) =>
      attr.trait_type.startsWith("xArtistsAI_")
    );

    const analysis: AiAnalysis = {};

    // Process each AI attribute
    aiAttributes.forEach((attr) => {
      const key = attr.trait_type.replace("xArtistsAI_", "");

      // Handle composition fields
      if (key.startsWith("compositionAnalysis_")) {
        if (!analysis.composition) {
          analysis.composition = {};
        }
        const compositionKey = key.replace("compositionAnalysis_", "");
        analysis.composition[compositionKey] = attr.value;
      }
      // Handle other fields
      else {
        analysis[key] = attr.value;
      }
    });

    return Object.keys(analysis).length > 0 ? analysis : null;
  } catch (e) {
    console.warn("Failed to parse AI analysis from NFT metadata", e);
    return null;
  }
}
