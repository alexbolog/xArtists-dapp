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
import ArtworkCard from "@/components/artwork-card";
import type { Artwork } from "@shared/schema";

export default function Gallery() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("votes");
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);

  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  useEffect(() => {
    if (!artworks) return;

    let sorted = [...artworks];

    // Apply search filter
    if (search) {
      sorted = sorted.filter(
        art => 
          art.title.toLowerCase().includes(search.toLowerCase()) ||
          art.description?.toLowerCase().includes(search.toLowerCase()) ||
          art.artist.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    switch (sort) {
      case "votes":
        sorted.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case "recent":
        sorted.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        break;
      case "highest_sales":
        sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
    }

    setFilteredArtworks(sorted);
  }, [artworks, search, sort]);

  const artworksForSale = artworks?.filter(a => a.price !== null) || [];

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
              <h2 className="text-2xl font-bold mb-6">Featured Artworks for Sale</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {artworksForSale.map((artwork) => (
                    <CarouselItem key={artwork.id} className="md:basis-1/2 lg:basis-1/3">
                      <Card>
                        <CardContent className="p-0">
                          <div className="aspect-square relative overflow-hidden rounded-t-lg">
                            <img
                              src={artwork.imageUrl}
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              <h3 className="text-lg font-semibold text-white mb-1">{artwork.title}</h3>
                              <p className="text-white/90 text-sm">by {artwork.artist}</p>
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold">{Number(artwork.price).toFixed(2)} TRO</p>
                              <p className="text-sm text-muted-foreground">Available for purchase</p>
                            </div>
                            <Button size="sm" className="gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Buy Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
                <h2 className="text-2xl font-semibold mb-2">No Artworks Listed for Sale</h2>
                <p className="text-muted-foreground">
                  Check back soon for new listings or browse our collection below
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input 
              placeholder="Search artworks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest_sales">Highest selling price</SelectItem>
              </SelectContent>
            </Select>
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