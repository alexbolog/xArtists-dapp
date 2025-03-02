import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Share2,
  Sparkles,
  ShoppingCart,
  Send,
  ExternalLink,
} from "lucide-react";
import { getNftById } from "@/api/mvx";
import { mapNftToArtwork } from "@/utils";
import type { ApiNft } from "@/api/mvx";
import type { Artwork } from "@shared/schema";
import { getDemoCollectionTokenId, TRO_TOKEN_ID } from "@/contracts/config";
import { extractAiAnalysis } from "@/utils";
import useDemoNftMinter from "@/contracts/hooks/useDemoNftMinter";
import BigNumber from "bignumber.js";

export default function ArtworkPage() {
  const { id } = useParams();
  const { getNftPrice, buyNft } = useDemoNftMinter();

  const nonceToHex = (nonce: number) => {
    let nonceHex = `${nonce.toString(16)}`;
    if (nonceHex.length % 2 === 1) {
      nonceHex = "0" + nonceHex;
    }
    return nonceHex;
  };

  const { data: nft, isLoading: isLoadingNft } = useQuery<ApiNft>({
    queryKey: [`nft-${id}`],
    queryFn: async () => {
      const identifier = `${getDemoCollectionTokenId()}-${nonceToHex(
        parseInt(id || "0")
      )}`;
      const nft = await getNftById(identifier);
      return nft;
    },
    enabled: !!id,
  });

  const { data: priceData, isLoading: isLoadingPrice } = useQuery({
    queryKey: [`nft-price-${id}`],
    queryFn: async () => {
      const nonce = parseInt(id || "0");
      const price = await getNftPrice(nonce);

      // it's an array of 3 elements
      return { amount: price[2].toString() };
    },
    enabled: !!id,
  });

  const aiAnalysis = nft ? extractAiAnalysis(nft) : null;

  if (isLoadingNft || isLoadingPrice) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-muted rounded-lg mb-8" />
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="h-24 bg-muted rounded mb-8" />
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          Artwork not found
        </h2>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/gallery")}
        >
          Return to Gallery
        </Button>
      </div>
    );
  }

  const artwork: Artwork = mapNftToArtwork(nft, priceData?.amount);

  // Update sale info to use actual price data
  const saleInfo = {
    isForSale:
      priceData?.amount !== null &&
      priceData?.amount !== "0" &&
      priceData?.amount !== undefined,
    price: priceData?.amount || null,
    // lastSoldPrice: "0", // Keep this as is or remove if not needed
  };

  const handleBuyNft = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const nonce = parseInt(id || "0");
    const price = priceData?.amount || "0";

    await buyNft(nonce, TRO_TOKEN_ID, price);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full rounded-lg shadow-lg"
        />
      </div>

      <div className="flex items-start justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            by {artwork.artist}
          </p>
          <p className="text-lg mb-8">{artwork.description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 transition-opacity"
          >
            <Heart className="h-5 w-5" />
            Like {artwork.voteCount ? `(${artwork.voteCount})` : ""}
          </Button>
          {saleInfo.isForSale ? (
            <Button
              size="lg"
              variant="default"
              className="gap-2 bg-green-500 hover:bg-green-600"
              onClick={handleBuyNft}
            >
              <ShoppingCart className="h-5 w-5" />
              Buy for {new BigNumber(priceData?.amount || "0").shiftedBy(-18).toString()} TRO
            </Button>
          ) : (
            <Button size="lg" variant="outline" className="gap-2">
              <Send className="h-5 w-5" />
              Contact Seller
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-primary/20 hover:border-primary transition-colors"
          >
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

      {artwork.hasPhysicalAsset && artwork.physicalAssetDetails && (
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Physical Artwork Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(artwork.physicalAssetDetails).map(
              ([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="font-medium">
                    {typeof value === "number"
                      ? `${value}${key.includes("weight") ? " kg" : " cm"}`
                      : value.toString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {artwork.mintedNftId && (
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">NFT Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Token ID</p>
              <p className="font-mono">{nft.identifier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creator</p>
              <a
                href={`${import.meta.env.VITE_EXPLORER_URL}/address/${
                  nft.creator
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-80"
              >
                <p className="font-mono">
                  {`${nft.creator.slice(0, 6)}...${nft.creator.slice(-6)}`}
                </p>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            {!saleInfo.isForSale && (
              <div>
                <p className="text-sm text-muted-foreground">Last Sold For</p>
                <p className="font-medium">N/A TRO</p>
              </div>
            )}
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="mt-8 p-6 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-purple-500">
              AI Analysis
            </h3>
          </div>
          <div className="space-y-4">
            {aiAnalysis.styleRecognition && (
              <div>
                <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                  Style Recognition
                </h4>
                <p className="text-sm">{aiAnalysis.styleRecognition}</p>
              </div>
            )}
            {aiAnalysis.colorPalette && (
              <div>
                <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                  Color Palette
                </h4>
                <p className="text-sm">{aiAnalysis.colorPalette}</p>
              </div>
            )}
            {aiAnalysis.composition &&
              Object.keys(aiAnalysis.composition).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                    Composition Analysis
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(aiAnalysis.composition).map(
                      ([key, value]) => (
                        <div key={key}>
                          <span className="text-sm text-purple-500/80 capitalize mr-1 ml-2">
                            <b>{key.replace(/([A-Z])/g, " $1").trim()}</b>
                          </span>
                          <span className="text-sm">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
