import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  insertArtworkSchema,
  physicalArtworkTypes,
  ArtworkType,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, Image, Sparkles } from "lucide-react";
import { z } from "zod";
import useDemoNftMinter from "@/contracts/hooks/useDemoNftMinter";
import { TRO_TOKEN_ID } from "@/contracts/config";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { getIpfsCIDs } from "@/api/internal";

export default function Create() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasPhysicalAsset, setHasPhysicalAsset] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const { isLoggedIn } = useGetLoginInfo();
  const { createNft } = useDemoNftMinter();

  const form = useForm<z.infer<typeof insertArtworkSchema>>({
    resolver: zodResolver(insertArtworkSchema),
    defaultValues: {
      title: "",
      description: "",
      artist: "",
      imageUrl: "",
      userId: 1, // Using demo user ID for now
      hasPhysicalAsset: false,
      artworkType: undefined,
      physicalAssetDetails: undefined,
    },
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const createArtwork = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/artworks", data);
      return res.json();
    },
    onSuccess: () => {
      setShowAiAnalysis(true); // Show AI analysis on successful creation
      toast({
        title: "Success",
        description: "Artwork uploaded and ready for minting",
      });
      setLocation("/gallery");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create artwork",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create URL for preview
      setPreviewUrl(URL.createObjectURL(file));

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        form.setValue("imageUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePhysicalAsset = (checked: boolean) => {
    setHasPhysicalAsset(checked);
    form.setValue("hasPhysicalAsset", checked);
    if (!checked) {
      form.setValue("artworkType", undefined);
      form.setValue("physicalAssetDetails", undefined);
    }
  };

  const handleArtworkTypeChange = (type: ArtworkType) => {
    form.setValue("artworkType", type);
    form.setValue("physicalAssetDetails", {});
  };

  const selectedType = form.watch("artworkType");

  const handleSubmit = async (data: any) => {
    try {
      const request = {
        ...data,
        imageBase64,
        imageUrl: null,
      };

      const { metadataUrl, imageUrl } = await getIpfsCIDs(request);
      const metadataCID = metadataUrl.split("/").pop();

      await createNft({
        name: request.title,
        royalties: "0",
        attributes: `tags:xArtists,AIMegaWaveHackathon${
          request.hasPhysicalAsset ? ",TokenizedPhysicalArtwork" : ""
        };metadata:${metadataCID}`,
        asset_uri: imageUrl,
        metadata_uri: metadataUrl,
        selling_price: "1000000000000000000",
        opt_token_used_as_payment: TRO_TOKEN_ID,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create artwork",
        variant: "destructive",
      });
    }
  };

  // Add early return if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-center">
          Connect to create NFTs
        </h1>
        <p className="text-muted-foreground text-center mb-4">
          You need to connect your wallet to create NFTs.
        </p>
        <Button onClick={() => setLocation("/unlock")}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create NFT</h1>

      <Card className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="mb-6">
              {previewUrl ? (
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="absolute bottom-4 right-4"
                    onClick={() => {
                      setPreviewUrl(null);
                      setImageBase64(null);
                      form.setValue("imageUrl", "");
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <label className="block">
                  <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload artwork
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </label>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <h2 className="text-lg font-medium">Physical Artwork</h2>
                <p className="text-sm text-muted-foreground">
                  Enable if this NFT represents a physical piece of art
                </p>
              </div>
              <Switch
                checked={hasPhysicalAsset}
                onCheckedChange={togglePhysicalAsset}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter artwork title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your artwork"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasPhysicalAsset && (
              <>
                <FormField
                  control={form.control}
                  name="artworkType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artwork Type</FormLabel>
                      <Select
                        onValueChange={handleArtworkTypeChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select artwork type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(physicalArtworkTypes).map(
                            ([value, type]) => (
                              <SelectItem key={value} value={value}>
                                {type.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType && (
                  <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-medium">Physical Details</h3>
                    {Object.entries(
                      physicalArtworkTypes[selectedType].metadata.shape
                    ).map(([key, value]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`physicalAssetDetails.${key}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{value.description}</FormLabel>
                            <FormControl>
                              <Input
                                type={
                                  value.typeName === "number"
                                    ? "number"
                                    : "text"
                                }
                                placeholder={value.description}
                                step="any"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  if (value.typeName === "number") {
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  } else {
                                    field.onChange(e.target.value);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createArtwork.isPending}
            >
              {createArtwork.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Create NFT
                </div>
              )}
            </Button>
          </form>
        </Form>

        {showAiAnalysis && (
          <div className="mt-8 p-6 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-purple-500">
                AI Analysis
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                  Style Recognition
                </h4>
                <p className="text-sm">
                  Contemporary abstract expressionism with influences from
                  digital art movements
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                  Color Palette
                </h4>
                <p className="text-sm">
                  Dominated by vibrant blues and warm earth tones, creating a
                  balanced composition
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                  Composition Analysis
                </h4>
                <p className="text-sm">
                  Strong diagonal elements with a central focal point, following
                  the rule of thirds
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-500/80 mb-1">
                  Unique Features
                </h4>
                <p className="text-sm">
                  Distinctive brushwork technique and innovative use of negative
                  space
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
