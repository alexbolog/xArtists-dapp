import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  tokenBalance: integer("token_balance").default(1000),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  artist: text("artist").notNull(),
  userId: integer("user_id").notNull(),
  mintedNftId: integer("minted_nft_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").notNull(),
  artworkId: integer("artwork_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  metadata: json("metadata").notNull(),
  isStaked: boolean("is_staked").default(false),
  stakedAt: timestamp("staked_at"),
  voteCount: integer("vote_count").default(0),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  nftId: integer("nft_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertArtworkSchema = createInsertSchema(artworks).pick({
  title: true,
  description: true,
  imageUrl: true,
  artist: true,
  userId: true,
});

export const insertNftSchema = createInsertSchema(nfts).pick({
  tokenId: true,
  artworkId: true,
  ownerId: true,
  metadata: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  nftId: true,
  userId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNftSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
