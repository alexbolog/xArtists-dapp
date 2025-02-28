import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { useQuery } from "@tanstack/react-query";
import { getAccountNfts } from "@/api/mvx";
import { getContractAddress } from "@/contracts/config";
import { useState, useRef } from "react";
import { ApiNft } from "@/api/mvx";
import useDemoEscrowContract from "@/contracts/hooks/useDemoEscrowContract";
import { Input } from "@/components/ui/input";
import SimpleApiNftArtworkCard from "@/components/simple-api-nft-artwork-card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getCollectionNfts } from "@/api/mvx";
import { getDemoCollectionTokenId } from "@/contracts/config";
import ArtworkCard from "@/components/artwork-card";
import { mapNftToArtwork } from "@/utils";
import useDemoNftMinter from "@/contracts/hooks/useDemoNftMinter";

interface ShippingDetails {
  name: string;
  address: string;
}

export default function PhysicalArt() {
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const { lock, getStatus } = useDemoEscrowContract();
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: "",
    address: "",
  });
  const [uploadedImages, setUploadedImages] = useState<{
    [key: string]: string;
  }>({});

  const { data: walletNftsData, isLoading } = useQuery<ApiNft[]>({
    queryKey: [`/api/users/${address}/nfts`, "wallet", address],
    enabled: isLoggedIn,
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const response = await getAccountNfts(address);
      console.log(response);
      return response;
    },
  });

  const { data: statusData, isLoading: statusLoading } = useQuery<any>({
    queryKey: ["status"],
    queryFn: async () => {
      const status = await getStatus(address);
      console.log(status);
      return status;
    },
  });

  const { data: escrowNftsData, isLoading: escrowNftsLoading } = useQuery<
    ApiNft[]
  >({
    queryKey: ["escrowNfts"],
    enabled: isLoggedIn && !!statusData?.locked_nonces,
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const response = await getAccountNfts(getContractAddress("DEMO_ESCROW"));

      console.log("All NFTs on escrow contract:", response);
      console.log("Status data locked nonces:", statusData?.locked_nonces);

      // Filter NFTs based on locked_nonces from statusData
      const filteredNfts = response.filter((nft) =>
        statusData?.locked_nonces.includes(nft.nonce)
      );

      console.log("Filtered Escrow NFTs:", filteredNfts);
      return filteredNfts;
    },
  });

  // Filter NFTs that have physical artwork metadata
  const physicalNfts: ApiNft[] =
    walletNftsData?.filter((nft) =>
      nft.tags.includes("TokenizedPhysicalArtwork")
    ) || [];

  const { getNftsForSaleMap } = useDemoNftMinter();

  const { data: collectionNfts } = useQuery<ApiNft[]>({
    queryKey: ["collection-nfts"],
    queryFn: () => getCollectionNfts(getDemoCollectionTokenId()),
  });

  const { data: priceMap } = useQuery<Record<string, string>>({
    queryKey: ["nfts-price-map"],
    queryFn: () => getNftsForSaleMap(),
  });

  // Transform ApiNft[] to Artwork[] with prices
  const artworksForSale = collectionNfts
    ?.map((nft) => mapNftToArtwork(nft, priceMap?.[nft.nonce.toString()]))
    .filter((artwork) => 
      artwork.price !== null && 
      artwork.hasPhysicalAsset
    );

  const handleLockNft = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedNft || !shippingDetails.name || !shippingDetails.address) {
      return;
    }

    const parts = selectedNft.split("-");
    const identifier = `${parts[0]}-${parts[1]}`;
    const nonce = parseInt(parts[2]);

    await lock(identifier, nonce);
  };

  // Add this mock data near the top of the component
  const mockPendingOrders = [
    {
      id: "7b75f73f898119be952d4b55119cf253",
      firstName: "John",
      lastName: "Doe",
      address: "123 Main St, New York, NY 10001",
      status: "pending",
    },
    {
      id: "4344334baea678d3c613b2e320172e7a",
      firstName: "Jane",
      lastName: "Smith",
      address: "456 Park Ave, Los Angeles, CA 90001",
      status: "unsent",
    },
    {
      id: "443142496fb6bd0ba9ad21cd4301072e",
      firstName: "Mike",
      lastName: "Johnson",
      address: "789 Oak Rd, Chicago, IL 60601",
      status: "pending",
    },
  ];

  // Add this mock data near the other mock data
  const mockAwaitingDeliveries = [
    {
      id: "9b75f73f898119be952d4b55119cf253",
      nftName: "Sunset Landscape #123",
      nftIdentifier: "LAND-4a5b6c-01",
      shippingAddress: "123 Main St, New York, NY 10001",
      status: "processing",
      estimatedDelivery: "2024-03-25",
    },
    {
      id: "8344334baea678d3c613b2e320172e7a",
      nftName: "Abstract Motion #456",
      nftIdentifier: "ABST-7d8e9f-02",
      shippingAddress: "456 Park Ave, Los Angeles, CA 90001",
      status: "shipped",
      estimatedDelivery: "2024-03-20",
      trackingNumber: "1Z999AA1234567890"
    },
  ];

  // Add this ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update the handleImageUpload function
  const handleImageUpload = async (nftIdentifier: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log(`Image uploaded for NFT ${nftIdentifier}:`, base64String);
        setUploadedImages((prev) => ({
          ...prev,
          [nftIdentifier]: base64String,
        }));
      };
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">NFT Escrow Service</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Available Physical Artworks</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-48 bg-muted rounded-lg" />
                <div className="h-48 bg-muted rounded-lg" />
              </div>
            ) : physicalNfts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {physicalNfts.map((nft) => (
                  <div
                    key={nft.identifier}
                    className={`cursor-pointer transition-all ${
                      selectedNft === nft.identifier
                        ? "bg-muted/50 shadow-[0_0_15px_rgba(var(--primary),.25)] scale-[1.02]"
                        : "hover:bg-muted/25"
                    }`}
                    onClick={() =>
                      setSelectedNft((prev) =>
                        prev === nft.identifier ? null : nft.identifier
                      )
                    }
                  >
                    <SimpleApiNftArtworkCard apiNft={nft} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center py-8 text-muted-foreground">
                  {artworksForSale && artworksForSale.length > 0 ? (
                    <p>You don't have any NFTs with claimable physical artwork. Browse the available artworks below.</p>
                  ) : (
                    <p>You don't have any NFTs with claimable physical artwork. Check back soon for new listings.</p>
                  )}
                </div>
                {artworksForSale && artworksForSale.length > 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {artworksForSale.slice(0, 3).map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} />
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Link href="/gallery">
                        <Button variant="ghost" className="gap-2">
                          View All
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {selectedNft && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Claim Physical Artwork</h2>
            <div className="space-y-4">
              <div className="flex flex-col p-4 border rounded-lg space-y-3">
                {physicalNfts
                  .filter(nft => nft.identifier === selectedNft)
                  .map(nft => (
                    <div key={nft.identifier}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{nft.name || `Token #${nft.identifier}`}</h3>
                          <p className="text-sm text-muted-foreground">{nft.identifier}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        >
                          ready to claim
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Full Name
                          </label>
                          <Input
                            value={shippingDetails.name}
                            onChange={(e) =>
                              setShippingDetails((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Shipping Address
                          </label>
                          <Input
                            value={shippingDetails.address}
                            onChange={(e) =>
                              setShippingDetails((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            placeholder="Enter your shipping address"
                          />
                        </div>
                        <Button
                          onClick={handleLockNft}
                          disabled={!shippingDetails.name || !shippingDetails.address}
                          className="w-full"
                        >
                          Lock NFT and Request Delivery
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}

        {/* Awaiting Deliveries section moved here */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">My Awaiting Deliveries</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {mockAwaitingDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-col p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{delivery.nftName}</h3>
                      <p className="text-sm text-muted-foreground">{delivery.nftIdentifier}</p>
                    </div>
                    <Badge 
                      variant={delivery.status === "processing" ? "secondary" : "default"}
                      className={
                        delivery.status === "processing" 
                          ? "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" 
                          : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Shipping to:</p>
                    <p>{delivery.shippingAddress}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p>Estimated Delivery: {delivery.estimatedDelivery}</p>
                    {delivery.trackingNumber && (
                      <Button variant="outline" size="sm" onClick={() => window.open(`https://track.example.com/${delivery.trackingNumber}`)}>
                        Track Package
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {mockAwaitingDeliveries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending deliveries.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
