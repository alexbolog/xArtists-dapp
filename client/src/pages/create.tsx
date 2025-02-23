import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertArtworkSchema } from "@shared/schema";
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
import { Card } from "@/components/ui/card";
import { Upload, Image } from "lucide-react";

export default function Create() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(insertArtworkSchema),
    defaultValues: {
      title: "",
      description: "",
      artist: "",
      imageUrl: "",
      userId: 1, // Using demo user ID for now
    },
  });

  const createArtwork = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/artworks", data);
      return res.json();
    },
    onSuccess: () => {
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
      // For demo, we'll use a sample image URL
      // In production, you'd upload to a storage service
      const sampleUrls = [
        "https://images.unsplash.com/photo-1734552452939-7d9630889748",
        "https://images.unsplash.com/photo-1734623044339-e8d370c1a0e1",
        "https://images.unsplash.com/photo-1737309150415-eaa7564b9e07"
      ];
      const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
      setPreviewUrl(URL.createObjectURL(file));
      form.setValue("imageUrl", randomUrl);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create NFT</h1>

      <Card className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createArtwork.mutate(data))}
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
      </Card>
    </div>
  );
}
