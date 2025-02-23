import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  tokenBalance: integer("token_balance").default(1000),
  governanceTokenBalance: decimal("governance_token_balance", { precision: 18, scale: 8 }).default("0"),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  artist: text("artist").notNull(),
  userId: integer("user_id").notNull(),
  mintedNftId: integer("minted_nft_id"),
  hasPhysicalAsset: boolean("has_physical_asset").default(false),
  physicalAssetDetails: text("physical_asset_details"),
  price: decimal("price", { precision: 18, scale: 8 }),
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
  stakingYield: decimal("staking_yield", { precision: 18, scale: 8 }).default("0"),
  lastYieldClaim: timestamp("last_yield_claim"),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  nftId: integer("nft_id").notNull(),
  userId: integer("user_id").notNull(),
  governanceTokensUsed: decimal("governance_tokens_used", { precision: 18, scale: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  creatorId: integer("creator_id").notNull(),
  status: text("status").notNull(), // active, passed, rejected
  votesFor: decimal("votes_for", { precision: 18, scale: 8 }).default("0"),
  votesAgainst: decimal("votes_against", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  endTime: timestamp("end_time").notNull(),
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
  hasPhysicalAsset: true,
  physicalAssetDetails: true,
  price: true,
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
  governanceTokensUsed: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  title: true,
  description: true,
  creatorId: true,
  endTime: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNftSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;