import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy } from "lucide-react";
import type { Artwork } from "@shared/schema";

interface ArtworkCardProps {
  artwork: Artwork;
  showActions?: boolean;
}

export default function ArtworkCard({ artwork, showActions = true }: ArtworkCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full aspect-square object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{artwork.title}</h3>
          <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
          {artwork.description && (
            <p className="mt-2 text-sm line-clamp-2">{artwork.description}</p>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Heart className="h-4 w-4 mr-1" />
            Vote
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Trophy className="h-4 w-4 mr-1" />
            Stake
          </Button>
          <Link href={`/artwork/${artwork.id}`}>
            <Button size="sm" className="flex-1">
              View
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
