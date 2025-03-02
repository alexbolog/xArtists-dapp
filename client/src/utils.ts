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

export const getRemoteMetadataContent = async (nft: ApiNft) => {
  try {
    const metadataJsonUri = Buffer.from(nft.uris[1], "base64").toString(
      "utf-8"
    );

    const metadataJson = await fetch(metadataJsonUri).then((res) => res.json());
    console.log("METADATA JSON", metadataJson);

    return {};
  } catch (err) {
    console.warn(`Failed to parse metadata from NFT ${nft.identifier}`, err);
    return {};
  }
};

export function mapNftToArtwork(
  nft: ApiNft,
  price?: string,
): Artwork {
  // Parse the metadata which might be in the attributes field
  let metadata: ApiNftMetadata = nft.metadata || {};

  const attributes = metadata.attributes || [];

  // Get artwork type (lowercase and cleaned)
  const artworkType =
    getAttributeValue(attributes, "artworkType")?.toLowerCase()?.trim() ||
    "digital";

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
    nft.tags?.some((tag) =>
      tag.toLowerCase().includes("tokenizedphysicalartwork")
    ) ||
    artworkType === "painting" ||
    artworkType === "sculpture";

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

interface Assessment {
  timestamp: number;
  score: number;
  remarks: string;
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

    const analysis: AiAnalysis = {
      assessments: [],
    };

    // Process each AI attribute
    aiAttributes.forEach((attr) => {
      const key = attr.trait_type.replace("xArtistsAI_", "");

      // Handle composition fields
      if (key.startsWith("composition_analysis_")) {
        if (!analysis.composition) {
          analysis.composition = {};
        }
        const compositionKey = key.replace("composition_analysis_", "");
        analysis.composition[compositionKey] = attr.value;
      }
      // Handle assessment fields
      else if (key.startsWith("assessment_")) {
        const parts = key.split("_");
        const timestamp = parts[1] === "initial" ? 0 : parseInt(parts[1]);
        const type = parts[2]; // "score" or "remarks"

        // Find or create assessment entry
        let assessment = analysis.assessments.find(
          (a: Assessment) => a.timestamp === timestamp
        );
        if (!assessment) {
          assessment = { timestamp, score: 0, remarks: "" };
          analysis.assessments.push(assessment);
        }

        // Update the appropriate field
        if (type === "score") {
          assessment.score =
            typeof attr.value === "number" ? attr.value : parseInt(attr.value);
        } else if (type === "remarks") {
          assessment.remarks = attr.value;
        } else if (type === "image_url") {
          assessment.imageUrl = attr.value;
        }
        assessment.imageUrl =
          "https://devnet-media.elrond.com/nfts/asset/Qmad7j928SbFHVLnC33HjabqyGNcDwq12C2PJ6da8fACR2";
      }
      // Handle specific fields with their exact names
      else if (key === "color_palette") {
        analysis.colorPalette = attr.value;
      } else if (key === "unique_features") {
        analysis.uniqueFeatures = attr.value;
      } else if (key === "style_recognition") {
        analysis.styleRecognition = attr.value;
      }
      // Handle other fields (style_recognition, etc.)
      else {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        analysis[camelCaseKey] = attr.value;
      }
    });

    // Sort assessments by timestamp
    analysis.assessments.sort(
      (a: Assessment, b: Assessment) => a.timestamp - b.timestamp
    );

    return Object.keys(analysis).length > 0 ? analysis : null;
  } catch (e) {
    console.warn("Failed to parse AI analysis from NFT metadata", e);
    return null;
  }
}
