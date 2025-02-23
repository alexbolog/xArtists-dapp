import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Wallet, Vote } from "lucide-react";
import ArtworkCard from "@/components/artwork-card";
import type { User, Artwork, NFT } from "@shared/schema";

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  // In a real app, we'd get the user ID from auth context
  const userId = 1;

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: nfts } = useQuery<NFT[]>({
    queryKey: [`/api/users/${userId}/nfts`],
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${userId}/artworks`],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your NFTs, staked assets, and rewards
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatsCard
          title="Token Balance"
          value={user?.tokenBalance || 0}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Staked NFTs"
          value={nfts?.filter((nft) => nft.isStaked).length || 0}
          icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Votes"
          value="24"
          icon={<Vote className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="created">
        <TabsList className="mb-8">
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="collected">Collected</TabsTrigger>
          <TabsTrigger value="staked">Staked</TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks?.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
            {!artworks?.length && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  You haven't created any artworks yet.
                </p>
                <Button className="mt-4">Create Your First NFT</Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="collected" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts?.filter((nft) => !nft.isStaked).map((nft) => (
              <ArtworkCard
                key={nft.id}
                artwork={{
                  id: nft.id,
                  title: nft.metadata.title as string,
                  description: nft.metadata.description as string,
                  imageUrl: nft.metadata.image as string,
                  artist: nft.metadata.artist as string,
                  userId: nft.ownerId,
                  mintedNftId: nft.id,
                  createdAt: new Date(),
                }}
              />
            ))}
            {!nfts?.filter((nft) => !nft.isStaked).length && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  You haven't collected any NFTs yet.
                </p>
                <Button className="mt-4">Browse Gallery</Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="staked" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts?.filter((nft) => nft.isStaked).map((nft) => (
              <ArtworkCard
                key={nft.id}
                artwork={{
                  id: nft.id,
                  title: nft.metadata.title as string,
                  description: nft.metadata.description as string,
                  imageUrl: nft.metadata.image as string,
                  artist: nft.metadata.artist as string,
                  userId: nft.ownerId,
                  mintedNftId: nft.id,
                  createdAt: new Date(),
                }}
              />
            ))}
            {!nfts?.filter((nft) => nft.isStaked).length && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  You haven't staked any NFTs yet.
                </p>
                <Button className="mt-4">Start Staking</Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
