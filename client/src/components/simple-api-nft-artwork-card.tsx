import { ApiNft } from "@/api/mvx";
import { Card, CardContent } from "./ui/card";
import { Link } from "wouter";

interface SimpleApiNftArtworkCardProps {
  apiNft: ApiNft;
}

export function SimpleApiNftArtworkCard({
  apiNft,
}: SimpleApiNftArtworkCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0 cursor-pointer">
        <div className="relative">
          <img
            src={apiNft.url}
            alt={apiNft.name}
            className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                {apiNft.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                by {apiNft.creator}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimpleApiNftArtworkCard;
