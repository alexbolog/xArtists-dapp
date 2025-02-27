import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { ApiNft } from "@/api/mvx";
import ApiNftArtworkCard from "@/components/api-nft-artwork-card";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { useQuery } from "@tanstack/react-query";
import { getAccountNfts } from "@/api/mvx";
import SimpleApiNftArtworkCard from "@/components/simple-api-nft-artwork-card";
import useDemoEscrowContract from "@/contracts/hooks/useDemoEscrowContract";
import { getContractAddress } from "@/contracts/config";
import { Badge } from "@/components/ui/badge";

export function EscrowPage() {
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const { lock, getStatus } = useDemoEscrowContract();
  const [selectedNft, setSelectedNft] = useState<string | null>(null);

  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({});

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
        setUploadedImages(prev => ({
          ...prev,
          [nftIdentifier]: base64String
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
        {/* New Admin Panel Section */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Escrow Admin Panel</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {escrowNftsLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 bg-muted rounded-lg" />
                  <div className="h-24 bg-muted rounded-lg" />
                </div>
              ) : escrowNftsData && escrowNftsData.length > 0 ? (
                <div className="space-y-2 md:space-y-4">
                  {escrowNftsData.map((nft) => (
                    <div
                      key={nft.identifier}
                      className="flex items-center justify-between p-3 md:p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative">
                          <img
                            src={nft.url || `https://picsum.photos/seed/${nft.identifier}/100/100`}
                            alt={`NFT ${nft.identifier}`}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base">
                            {nft.name || `Token #${nft.identifier}`}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {nft.identifier}
                          </p>
                        </div>
                      </div>
                      {uploadedImages[nft.identifier] ? (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={uploadedImages[nft.identifier]}
                              alt="Uploaded preview"
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => {
                                setUploadedImages(prev => {
                                  const newImages = { ...prev };
                                  delete newImages[nft.identifier];
                                  return newImages;
                                });
                              }}
                            >
                              ×
                            </Button>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              console.log("Submitting image for NFT:", nft.identifier);
                              console.log("Image data:", uploadedImages[nft.identifier]);
                            }}
                          >
                            Submit
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.setAttribute('data-nft-id', nft.identifier);
                              fileInputRef.current.click();
                            }
                          }}
                        >
                          Upload Picture
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No NFTs currently locked in escrow.</p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
          </div>
        </Card>

        {/* Add this container after the existing Card component */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {mockPendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {order.firstName} {order.lastName}
                      </h3>
                      <Badge 
                        variant={order.status === "pending" ? "default" : "secondary"}
                        className={
                          order.status === "pending" 
                            ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" 
                            : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                    <p className="text-xs text-muted-foreground">Tag ID: {order.id}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Mark as Sent
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const nftIdentifier = fileInputRef.current?.getAttribute('data-nft-id');
            if (file && nftIdentifier) {
              handleImageUpload(nftIdentifier, file);
            }
          }}
        />
      </div>
    </div>
  );
}

export default EscrowPage;
