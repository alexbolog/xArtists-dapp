import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Tag, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Artwork } from "@shared/schema";

interface ArtworkCardProps {
  artwork: Artwork;
  showActions?: boolean;
  isStaked?: boolean;
  stakingYield?: string;
}

export default function ArtworkCard({ 
  artwork, 
  showActions = true,
  isStaked = false,
  stakingYield = "0"
}: ArtworkCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        {artwork.hasPhysicalAsset && (
          <Badge variant="secondary" className="bg-white/90">
            Physical Asset
          </Badge>
        )}
        {isStaked && (
          <Badge variant="secondary" className="bg-primary/90 text-white">
            <Lock className="mr-1 h-3 w-3" />
            Staked
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

          {isStaked && (
            <div className="mt-3 p-2 bg-primary/5 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Staking Yield</span>
                <span className="font-medium text-primary">{stakingYield} GOV</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2 p-4 pt-0">
          {!isStaked ? (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="h-4 w-4 mr-1" />
                Vote
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Trophy className="h-4 w-4 mr-1" />
                Stake
              </Button>
              {artwork.price && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Tag className="h-4 w-4 mr-1" />
                  Buy
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" size="sm" className="flex-1">
              <Lock className="h-4 w-4 mr-1" />
              Unstake
            </Button>
          )}
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