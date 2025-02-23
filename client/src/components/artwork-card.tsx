import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Artwork } from "@shared/schema";

interface ArtworkCardProps {
  artwork: Artwork;
  showActions?: boolean;
}

export default function ArtworkCard({ 
  artwork, 
  showActions = true,
}: ArtworkCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        {artwork.hasPhysicalAsset && (
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            Physical Asset
          </Badge>
        )}
      </div>

      <CardContent className="p-0">
        <div className="relative">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{artwork.title}</h3>
              <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
            </div>
            {artwork.price && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">{artwork.price} ETH</p>
              </div>
            )}
          </div>

          {artwork.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {artwork.description}
            </p>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2 p-4 pt-0">
          <Button 
            variant="default"
            size="sm" 
            className="flex-1 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 transition-opacity"
          >
            <Heart className="h-4 w-4 mr-1" />
            Vote
          </Button>
          {artwork.price && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-primary/20 hover:border-primary transition-colors"
            >
              <Tag className="h-4 w-4 mr-1" />
              Buy
            </Button>
          )}
          <Link href={`/artwork/${artwork.id}`}>
            <Button 
              size="sm" 
              variant="secondary"
              className="flex-1 hover:bg-secondary/80 transition-colors"
            >
              View
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}