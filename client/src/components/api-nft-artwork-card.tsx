import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Artwork } from "@shared/schema";
import { ApiNft } from "@/api/mvx";
import { mapNftToArtwork } from "@/utils";
import ArtworkCard from "./artwork-card";

interface ApiNftArtworkCardProps {
  apiNft: ApiNft;
  price?: string;
  showActions?: boolean;
}

export default function ApiNftArtworkCard({
  apiNft,
  price,
  showActions = true,
}: ApiNftArtworkCardProps) {
  const artwork = mapNftToArtwork(apiNft, price);
  return <ArtworkCard artwork={artwork} showActions={showActions} />;
}
