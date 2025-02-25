import { 
  User, InsertUser, Artwork, InsertArtwork,
  NFT, InsertNFT, Vote, InsertVote 
} from "@shared/schema";

interface Proposal {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  status: "active" | "passed" | "rejected";
  votesFor: string;
  votesAgainst: string;
  startTime: Date;
  endTime: Date;
  minVotingPower: string;
  eligibleTokens: string[];
  createdAt: Date;
}

interface InsertProposal {
  title: string;
  description: string;
  creatorId: number;
  startTime: Date;
  endTime: Date;
  minVotingPower: string;
  eligibleTokens: string[];
}

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

  // Proposals
  listProposals(): Promise<Proposal[]>;
  getProposal(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artworks: Map<number, Artwork>;
  private nfts: Map<number, NFT>;
  private votes: Map<number, Vote>;
  private proposals: Map<number, Proposal>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.nfts = new Map();
    this.votes = new Map();
    this.proposals = new Map();
    this.currentIds = { users: 1, artworks: 1, nfts: 1, votes: 1, proposals: 1 };

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

  async listProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const id = this.currentIds.proposals++;
    const newProposal: Proposal = {
      ...proposal,
      id,
      status: "active",
      votesFor: "0",
      votesAgainst: "0",
      createdAt: new Date()
    };
    this.proposals.set(id, newProposal);
    return newProposal;
  }

  private initializeSampleData() {
    this.createUser({
      username: "demo",
      password: "demo123",
      walletAddress: "0x123...abc"
    });

    // Add sample NFTs data first
    const sampleNfts = [
      {
        tokenId: "1",
        artworkId: 1,
        ownerId: 1,
        metadata: { 
          name: "Abstract Harmony NFT", 
          description: "First NFT in the collection",
          quantity: 1,
          type: "NFT"
        },
        isStaked: true,
        stakedAt: new Date(),
        voteCount: 125,
        stakingYield: "10.5"
      },
      {
        tokenId: "2",
        artworkId: 2,
        ownerId: 1,
        metadata: { 
          name: "Digital Dreams NFT", 
          description: "Second NFT in the collection",
          quantity: 5,
          type: "SFT"
        },
        isStaked: false,
        stakedAt: null,
        voteCount: 89,
        stakingYield: "8.2"
      },
      {
        tokenId: "3",
        artworkId: 3,
        ownerId: 1,
        metadata: { 
          name: "Bronze Guardian NFT", 
          description: "Third NFT in the collection",
          quantity: 1,
          type: "NFT"
        },
        isStaked: true,
        stakedAt: new Date(),
        voteCount: 45,
        stakingYield: "15.7"
      },
      {
        tokenId: "4",
        artworkId: 4,
        ownerId: 1,
        metadata: { 
          name: "Sunset Reflections NFT", 
          description: "Fourth NFT in the collection",
          quantity: 3,
          type: "SFT"
        },
        isStaked: false,
        stakedAt: null,
        voteCount: 67,
        stakingYield: "12.3"
      }
    ];

    // Create NFTs first
    sampleNfts.forEach(nft => this.createNFT(nft));

    // Then create artworks
    const sampleArtworks = [
      {
        title: "Abstract Harmony",
        description: "A vibrant exploration of color and form",
        imageUrl: "https://images.unsplash.com/photo-1734552452939-7d9630889748",
        artist: "John Artist",
        userId: 1,
        hasPhysicalAsset: true,
        artworkType: "painting",
        physicalAssetDetails: {
          width: 60,
          height: 90,
          depth: 4,
          weight: 2.5,
          medium: "Oil",
          surface: "Canvas"
        },
        price: "0.5",
        voteCount: 125
      },
      {
        title: "Digital Dreams",
        description: "Where technology meets creativity",
        imageUrl: "https://images.unsplash.com/photo-1734623044339-e8d370c1a0e1",
        artist: "Jane Creator",
        userId: 1,
        hasPhysicalAsset: false,
        price: "0.3",
        voteCount: 89
      },
      {
        title: "Bronze Guardian",
        description: "A majestic sculpture capturing movement and strength",
        imageUrl: "https://images.unsplash.com/photo-1737309150415-eaa7564b9e07",
        artist: "Michael Sculptor",
        userId: 1,
        hasPhysicalAsset: true,
        artworkType: "sculpture",
        physicalAssetDetails: {
          width: 40,
          height: 120,
          depth: 40,
          weight: 15.5,
          material: "Bronze",
          technique: "Lost-wax casting",
          baseIncluded: true
        },
        price: "2.5",
        voteCount: 45
      },
      {
        title: "Sunset Reflections",
        description: "A peaceful landscape capturing the golden hour",
        imageUrl: "https://images.unsplash.com/photo-1734623044339-e8d370c1a0e1",
        artist: "Maria Painter",
        userId: 1,
        hasPhysicalAsset: true,
        artworkType: "painting",
        physicalAssetDetails: {
          width: 80,
          height: 60,
          depth: 3,
          weight: 1.8,
          medium: "Acrylic",
          surface: "Wood Panel"
        },
        price: null,
        voteCount: 67
      }
    ];

    sampleArtworks.forEach(artwork => this.createArtwork(artwork));

    // Add sample proposals
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 7);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 7);

    const sampleProposals = [
      {
        id: 1,
        title: "Reduce Platform Fees",
        description: "Proposal to reduce platform fees from 2.5% to 1.5% to encourage more artists to join the platform. This will help grow our community and increase overall transaction volume.",
        creatorId: 1,
        status: "active",
        votesFor: "1500.00",
        votesAgainst: "1000.00",
        startTime: now,
        endTime: futureDate,
        minVotingPower: "100.00",
        eligibleTokens: ["gov", "stake"],
        createdAt: now
      },
      {
        id: 2,
        title: "Increase Staking Rewards",
        description: "Successfully implemented a 20% increase in staking rewards to incentivize long-term holding and platform participation.",
        creatorId: 1,
        status: "passed",
        votesFor: "2500.00",
        votesAgainst: "500.00",
        startTime: pastDate,
        endTime: now,
        minVotingPower: "50.00",
        eligibleTokens: ["gov"],
        createdAt: pastDate
      },
      {
        id: 3,
        title: "Mandatory Physical Verification",
        description: "Proposal to require in-person verification for all physical artworks was rejected due to logistical challenges and potential barriers to entry.",
        creatorId: 1,
        status: "rejected",
        votesFor: "800.00",
        votesAgainst: "2200.00",
        startTime: pastDate,
        endTime: now,
        minVotingPower: "200.00",
        eligibleTokens: ["gov", "art"],
        createdAt: pastDate
      }
    ];

    sampleProposals.forEach(proposal => this.proposals.set(proposal.id, proposal));
  }
}

export const storage = new MemStorage();