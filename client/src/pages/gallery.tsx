import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

export default function Gallery() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("votes");
  const [filteredArtworks, setFilteredArtworks] = useState<ApiNft[]>([]);

  const { data: artworks, isLoading } = useQuery<ApiNft[]>({
    queryKey: ["collection-nfts"],
    queryFn: () => getCollectionNfts(getDemoCollectionTokenId()),
  });

  useEffect(() => {
    if (!artworks) return;

    let sorted = [...artworks];

    // Apply search filter
    if (search) {
      sorted = sorted.filter(
        /*
        art => 
          art.title.toLowerCase().includes(search.toLowerCase()) ||
          art.description?.toLowerCase().includes(search.toLowerCase()) ||
          art.artist.toLowerCase().includes(search.toLowerCase())
         */
        (nft) =>
          nft.name.toLowerCase().includes(search.toLowerCase()) ||
          nft.metadata?.description
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          nft.creator.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    switch (sort) {
      case "recent":
        sorted.sort((a, b) => b.nonce - a.nonce);
        break;
      // Note: Removed votes and highest_sales sorting as they're not available in ApiNft
    }

    setFilteredArtworks(sorted);
  }, [artworks, search, sort]);

  //   const artworksForSale = artworks?.filter(a => a.price !== null) || [];
  const artworksForSale = artworks || []; // For now, showing all NFTs in featured section

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
                  {artworksForSale.map((nft) => (
                    <CarouselItem
                      key={nft.identifier}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <ApiNftArtworkCard apiNft={nft} />
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
            {filteredArtworks.map((nft) => (
              <ApiNftArtworkCard key={nft.identifier} apiNft={nft} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}