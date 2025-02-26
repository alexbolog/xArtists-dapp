export type EsdtTokenPayment = {
  token_identifier: string;
  token_nonce: number;
  amount: string; // BigUint represented as string
};

export type UnstakingBatch = {
  unstake_timestamp: number;
  unstake_items: EsdtTokenPayment[];
};

export type StakingInfo = {
  staked_items: EsdtTokenPayment[];
  staked_score: string; // BigUint represented as string
  aggregated_staked_score: string; // BigUint represented as string
  pending_rewards: EsdtTokenPayment[];
  unstaking_items: UnstakingBatch[];
};

// Additional helper type for distribution plan raw data
export type DistributionPlanRaw = {
  token_identifier: string;
  start_round: number;
  end_round: number;
  amount_per_round: string; // BigUint represented as string
}[];

export enum VoteDecision {
  Invalid = 0,
  Approve = 1,
  Abstain = 2,
  Reject = 3,
}

export enum ProposalStatus {
  Invalid = 0,
  Pending = 1,
  Active = 2,
  Approved = 3,
  Rejected = 4,
  Failed = 5,
}

export type Proposal = {
  id: number;
  title: string;
  description: string;
  creator: string; // Address as bech32 string
  created_at: number;
  start_time: number;
  end_time: number;
  min_voting_power_to_validate_vote: string; // BigUint represented as string
};

export type VoteContext = {
  decision: VoteDecision;
  voting_power: string; // BigUint represented as string
  timestamp: number;
  block: number;
  epoch: number;
};

export type ProposalVoteCount = {
  approve: string; // BigUint represented as string
  abstain: string; // BigUint represented as string
  reject: string; // BigUint represented as string
  invalid: string; // BigUint represented as string
};

export type ProposalContext = {
  proposal: Proposal;
  users_voting_power: string; // BigUint represented as string
  users_vote: VoteContext | null; // Option<VoteContext> represented as nullable
  proposal_status: ProposalStatus;
  proposal_vote_count: ProposalVoteCount;
};

export type StakeEvent = {
  caller: string; // Address as bech32 string
  payments: EsdtTokenPayment[];
};

export type StakingContext = {
  users_stake: EsdtTokenPayment[];
  last_proposals_context: ProposalContext;
  active_proposal_ids: number[];
};

export type ProposalCreatedEvent = {
  creator: string; // Address as bech32 string
  proposal_id: number;
  title: string;
  min_voting_power: string; // BigUint represented as string
  start_time: number;
  end_time: number;
};

export type FullProposalContext = {
  proposal: Proposal;
  users_voting_power: string; // BigUint represented as string
  users_vote: VoteContext | null; // Option<VoteContext> represented as nullable
  proposal_status: ProposalStatus;
  proposal_vote_count: ProposalVoteCount;
};


// Demo nft minter types
export interface NftContent {
  name: string;
  royalties: string; // BigUint represented as string
  attributes: string; // bytes represented as string
  asset_uri: string; // bytes represented as string
  metadata_uri: string; // bytes represented as string
}

export interface PriceTag {
  token: string; // EgldOrEsdtTokenIdentifier represented as string
  nonce: number; // u64
  amount: string; // BigUint represented as string
}

export interface NftForSale {
  nft_nonce: number; // u64
  price_tag: PriceTag;
  nft_content: NftContent;
}

// Additional interfaces for endpoint inputs/outputs
export interface CreateNftArgs {
  name: string;
  royalties: string;
  attributes: string;
  asset_uri: string;
  metadata_uri: string;
  selling_price: string;
  opt_token_used_as_payment?: string;
  opt_token_used_as_payment_nonce?: number;
}

export interface ClaimRoyaltiesArgs {
  marketplace_address: string; // Address represented as string
  token_id: string;
  token_nonce: number;
}

export interface IssueTokenArgs {
  token_name: string;
  token_ticker: string;
}

export interface OptionalPriceTag {
  token: string;
  nonce: number;
  amount: string;
}