import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Share2 } from "lucide-react";
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
          <Button size="lg" className="gap-2">
            <Heart className="h-5 w-5" />
            Vote
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Trophy className="h-5 w-5" />
            Stake
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
