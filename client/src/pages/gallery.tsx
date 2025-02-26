import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ShoppingCart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApiNftArtworkCard from "@/components/api-nft-artwork-card";
import { getCollectionNfts } from "@/api/mvx";
import { getDemoCollectionTokenId } from "@/contracts/config";
import type { ApiNft } from "@/api/mvx";
import type { Artwork } from "@shared/schema";
import ArtworkCard from "@/components/artwork-card";
import { mapNftToArtwork } from "@/utils";

export default function Gallery() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("votes");
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);

  const { data: apiNfts, isLoading } = useQuery<ApiNft[]>({
    queryKey: ["collection-nfts"],
    queryFn: () => getCollectionNfts(getDemoCollectionTokenId()),
  });

  // Transform ApiNft[] to Artwork[]
  const artworks = apiNfts?.map((nft) => mapNftToArtwork(nft));

  useEffect(() => {
    if (!artworks) return;

    let sorted = [...artworks];

    if (search) {
      sorted = sorted.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(search.toLowerCase()) ||
          artwork.description?.toLowerCase().includes(search.toLowerCase()) ||
          artwork.artist.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    // switch (sort) {
    //   case "recent":
    //     sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    //     break;
    // }

    setFilteredArtworks(sorted);
  }, [artworks, search, sort]);

  const artworksForSale = artworks || [];

  return (
    <div>
      {isLoading ? (
        <div className="space-y-8">
          <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {artworksForSale.length > 0 ? (
            <div className="bg-primary/5 p-8 rounded-lg border">
              <h2 className="text-2xl font-bold mb-6">
                Featured Artworks for Sale
              </h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {artworksForSale.map((artwork) => (
                    <CarouselItem
                      key={artwork.id}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <ArtworkCard artwork={artwork} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  No Artworks Listed for Sale
                </h2>
                <p className="text-muted-foreground">
                  Check back soon for new listings or browse our collection
                  below
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <Input
              placeholder="Search artworks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest_sales">Highest selling price</SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
