import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ArtworkCard from "@/components/artwork-card";
import type { Artwork } from "@shared/schema";

function Hero() {
  return (
    <div
      className="relative py-24 px-6 rounded-lg overflow-hidden mb-12"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1507643179773-3e975d7ac515)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-3xl mx-auto text-center text-white">
        <h1 className="text-4xl font-bold mb-4">
          Transform Your Physical Art into Digital Assets
        </h1>
        <p className="text-lg mb-8 text-gray-200">
          Create, collect, and trade unique NFTs from your physical artwork
        </p>
        <Link href="/create">
          <Button size="lg" className="gap-2">
            Create Your First NFT
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  return (
    <div>
      <Hero />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Artworks</h2>
          <Link href="/gallery">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks?.slice(0, 3).map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
