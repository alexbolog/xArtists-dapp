import { 
  User, InsertUser, Artwork, InsertArtwork,
  NFT, InsertNFT, Vote, InsertVote 
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(id: number, amount: number): Promise<User>;

  // Artworks
  getArtwork(id: number): Promise<Artwork | undefined>;
  listArtworks(): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;

  // NFTs
  getNFT(id: number): Promise<NFT | undefined>;
  listNFTs(): Promise<NFT[]>;
  createNFT(nft: InsertNFT): Promise<NFT>;
  updateNFTStakeStatus(id: number, isStaked: boolean): Promise<NFT>;
  updateNFTVotes(id: number, increment: boolean): Promise<NFT>;

  // Votes
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByNFT(nftId: number): Promise<Vote[]>;
  hasUserVoted(userId: number, nftId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artworks: Map<number, Artwork>;
  private nfts: Map<number, NFT>;
  private votes: Map<number, Vote>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.nfts = new Map();
    this.votes = new Map();
    this.currentIds = { users: 1, artworks: 1, nfts: 1, votes: 1 };

    // Add sample data
    this.initializeSampleData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { 
      ...insertUser, 
      id, 
      tokenBalance: 1000,
      governanceTokenBalance: "0" 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokens(id: number, amount: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updated = { 
      ...user, 
      tokenBalance: (user.tokenBalance || 0) + amount 
    };
    this.users.set(id, updated);
    return updated;
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async listArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworks.values());
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.currentIds.artworks++;
    const artwork: Artwork = { 
      ...insertArtwork, 
      id, 
      mintedNftId: null,
      hasPhysicalAsset: insertArtwork.hasPhysicalAsset || false,
      physicalAssetDetails: insertArtwork.physicalAssetDetails || null,
      price: insertArtwork.price || null,
      createdAt: new Date()
    };
    this.artworks.set(id, artwork);
    return artwork;
  }

  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }

  async listNFTs(): Promise<NFT[]> {
    return Array.from(this.nfts.values());
  }

  async createNFT(insertNft: InsertNFT): Promise<NFT> {
    const id = this.currentIds.nfts++;
    const nft: NFT = {
      ...insertNft,
      id,
      isStaked: false,
      stakedAt: null,
      voteCount: 0,
      stakingYield: "0",
      lastYieldClaim: null
    };
    this.nfts.set(id, nft);
    return nft;
  }

  async updateNFTStakeStatus(id: number, isStaked: boolean): Promise<NFT> {
    const nft = await this.getNFT(id);
    if (!nft) throw new Error("NFT not found");
    const updated = { 
      ...nft, 
      isStaked, 
      stakedAt: isStaked ? new Date() : null 
    };
    this.nfts.set(id, updated);
    return updated;
  }

  async updateNFTVotes(id: number, increment: boolean): Promise<NFT> {
    const nft = await this.getNFT(id);
    if (!nft) throw new Error("NFT not found");
    const updated = { 
      ...nft, 
      voteCount: (nft.voteCount || 0) + (increment ? 1 : -1)
    };
    this.nfts.set(id, updated);
    return updated;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentIds.votes++;
    const vote: Vote = { ...insertVote, id, createdAt: new Date() };
    this.votes.set(id, vote);
    return vote;
  }

  async getVotesByNFT(nftId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(v => v.nftId === nftId);
  }

  async hasUserVoted(userId: number, nftId: number): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      v => v.userId === userId && v.nftId === nftId
    );
  }

  private initializeSampleData() {
    // Add sample user
    this.createUser({
      username: "demo",
      password: "demo123",
      walletAddress: "0x123...abc"
    });

    // Add sample artworks
    const sampleArtworks = [
      {
        title: "Abstract Harmony",
        description: "A vibrant exploration of color and form",
        imageUrl: "https://images.unsplash.com/photo-1734552452939-7d9630889748",
        artist: "John Artist",
        userId: 1,
        hasPhysicalAsset: true,
        physicalAssetDetails: "Original canvas painting, 24x36 inches",
        price: "0.5"
      },
      {
        title: "Digital Dreams",
        description: "Where technology meets creativity",
        imageUrl: "https://images.unsplash.com/photo-1734623044339-e8d370c1a0e1",
        artist: "Jane Creator",
        userId: 1,
        hasPhysicalAsset: false,
        price: "0.3"
      }
    ];

    sampleArtworks.forEach(artwork => this.createArtwork(artwork));
  }
}

export const storage = new MemStorage();