import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Sparkles, ShoppingCart, Send } from "lucide-react";
import type { Artwork } from "@shared/schema";

export default function ArtworkPage() {
  const { id } = useParams();

  const { data: artwork, isLoading } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${id}`],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-muted rounded-lg mb-8" />
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="h-24 bg-muted rounded mb-8" />
      </div>
    );
  }

  if (!artwork) {
    return <div>Artwork not found</div>;
  }

  // Demo price data - in production this would come from the API
  const saleInfo = {
    isForSale: artwork.price !== null,
    price: artwork.price || "0.5",
    lastSoldPrice: "0.3"
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
          <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 transition-opacity">
            <Heart className="h-5 w-5" />
            Like {artwork.voteCount ? `(${artwork.voteCount})` : ''}
          </Button>
          {saleInfo.isForSale ? (
            <Button 
              size="lg" 
              variant="default" 
              className="gap-2 bg-green-500 hover:bg-green-600"
            >
              <ShoppingCart className="h-5 w-5" />
              Buy for {saleInfo.price} ETH
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2"
            >
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
          <h2 className="text-xl font-semibold mb-4">Physical Artwork Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(artwork.physicalAssetDetails).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="font-medium">
                  {typeof value === 'number' 
                    ? `${value}${key.includes('weight') ? ' kg' : ' cm'}`
                    : value.toString()
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {artwork.mintedNftId && (
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">NFT Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Token ID</p>
              <p className="font-mono">{artwork.mintedNftId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-mono truncate">0x123...abc</p>
            </div>
            {!saleInfo.isForSale && (
              <div>
                <p className="text-sm text-muted-foreground">Last Sold For</p>
                <p className="font-medium">{saleInfo.lastSoldPrice} ETH</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-6 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-purple-500">AI Analysis</h3>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-purple-500/80 mb-1">Style Recognition</h4>
            <p className="text-sm">Contemporary abstract expressionism with influences from digital art movements</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-500/80 mb-1">Color Palette</h4>
            <p className="text-sm">Dominated by vibrant blues and warm earth tones, creating a balanced composition</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-500/80 mb-1">Composition Analysis</h4>
            <p className="text-sm">Strong diagonal elements with a central focal point, following the rule of thirds</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-500/80 mb-1">Unique Features</h4>
            <p className="text-sm">Distinctive brushwork technique and innovative use of negative space</p>
          </div>
        </div>
      </div>
    </div>
  );
}