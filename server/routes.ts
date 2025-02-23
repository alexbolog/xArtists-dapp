import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertArtworkSchema, insertNftSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  // List all artworks
  app.get("/api/artworks", async (_req, res) => {
    const artworks = await storage.listArtworks();
    res.json(artworks);
  });

  // Get single artwork
  app.get("/api/artworks/:id", async (req, res) => {
    const artwork = await storage.getArtwork(Number(req.params.id));
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });
    res.json(artwork);
  });

  // Create new artwork
  app.post("/api/artworks", async (req, res) => {
    try {
      const data = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(data);
      res.status(201).json(artwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid artwork data" });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // List all NFTs
  app.get("/api/nfts", async (_req, res) => {
    const nfts = await storage.listNFTs();
    res.json(nfts);
  });

  // Get single NFT
  app.get("/api/nfts/:id", async (req, res) => {
    const nft = await storage.getNFT(Number(req.params.id));
    if (!nft) return res.status(404).json({ message: "NFT not found" });
    res.json(nft);
  });

  // Create new NFT
  app.post("/api/nfts", async (req, res) => {
    try {
      const data = insertNftSchema.parse(req.body);
      const nft = await storage.createNFT(data);
      res.status(201).json(nft);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid NFT data" });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Update NFT stake status
  app.patch("/api/nfts/:id/stake", async (req, res) => {
    try {
      const nft = await storage.updateNFTStakeStatus(
        Number(req.params.id),
        req.body.isStaked
      );
      res.json(nft);
    } catch (error) {
      res.status(404).json({ message: "NFT not found" });
    }
  });

  // Vote for an NFT
  app.post("/api/votes", async (req, res) => {
    try {
      const data = insertVoteSchema.parse(req.body);
      
      // Check if user has already voted
      const hasVoted = await storage.hasUserVoted(data.userId, data.nftId);
      if (hasVoted) {
        return res.status(400).json({ message: "User has already voted" });
      }

      const vote = await storage.createVote(data);
      await storage.updateNFTVotes(data.nftId, true);
      await storage.updateUserTokens(data.userId, 10); // Reward for voting
      
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vote data" });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
