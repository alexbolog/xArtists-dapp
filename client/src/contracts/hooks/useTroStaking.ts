import useContract from "./useContract";
import abi from "../abis/tro-staking.abi.json";
import { AbiRegistry, Address, TokenTransfer } from "@multiversx/sdk-core/out";
import { BigNumber } from "bignumber.js";
import { getContractAddress } from "../config";
import {
  EsdtTokenPayment,
  FullProposalContext,
  Proposal,
  ProposalContext,
  ProposalStatus,
  StakingContext,
  VoteContext,
  VoteDecision,
} from "../types";

const DEFAULT_GAS_LIMIT = 25_000_000;

const useTroStaking = () => {
  const CONTRACT_ADDRESS_KEY = "TRO_GOVERNANCE";
  const { create, handleQueryContract, handleSendTransaction } = useContract();

  // Utility functions
  const getTroStakingContract = () => {
    const address = getContractAddress(CONTRACT_ADDRESS_KEY);
    const abiRegistry = AbiRegistry.create(abi);
    return create(abiRegistry, Address.fromBech32(address));
  };

  // Read functions
  const getTroTokenIdentifier = async (): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getTroTokenIdentifier();
    return handleQueryContract<string>(interaction);
  };

  const getWhitelistedLpTokenIdentifiers = async (): Promise<string[]> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getWhitelistedLpTokenIdentifiers();
    return handleQueryContract<string[]>(interaction);
  };

  const getUsersStake = async (
    usersAddress: string,
    tokenIdentifier: string
  ): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUsersStake([
      Address.fromBech32(usersAddress),
      tokenIdentifier,
    ]);
    return handleQueryContract<string>(interaction);
  };

  const getLastProposalId = async (): Promise<number> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getLastProposalId();
    return handleQueryContract<number>(interaction);
  };

  const getProposal = async (proposalId: number): Promise<Proposal> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposal([proposalId]);
    return handleQueryContract<Proposal>(interaction);
  };

  const getProposalVotes = async (
    proposalId: number,
    decision: VoteDecision
  ): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposalVotes([
      proposalId,
      decision,
    ]);
    return handleQueryContract<string>(interaction);
  };

  const getUserVote = async (
    user: string,
    proposalId: number
  ): Promise<VoteContext> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUserVote([
      Address.fromBech32(user),
      proposalId,
    ]);
    return handleQueryContract<VoteContext>(interaction);
  };

  const getFullProposalContext = async (
    user: string
  ): Promise<Array<FullProposalContext>> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getAllProposals([
      Address.fromBech32(user),
    ]);
    const rawResponse = await handleQueryContract<Array<any>>(interaction);
    console.log("rawResponse", rawResponse);
    try {
      return rawResponse.map((context) => ({
        ...context,
        proposal: {
          ...context.proposal,
          title: Buffer.from(context.proposal.title).toString(),
          description: Buffer.from(context.proposal.description).toString(),
          creator: context.proposal.creator?.toString() || "",
          id: Number(context.proposal.id),
          created_at: Number(context.proposal.created_at) * 1000,
          start_time: Number(context.proposal.start_time) * 1000,
          end_time: Number(context.proposal.end_time) * 1000,
        },
        proposal_status: context.proposal_status.toNumber(),
        proposal_vote_count: {
          approve: Number(context.proposal_vote_count.approve),
          reject: Number(context.proposal_vote_count.reject),
          abstain: Number(context.proposal_vote_count.abstain),
          invalid: Number(context.proposal_vote_count.invalid),
        },
        users_vote: {},
        users_voting_power: Number(context.users_voting_power),
      }));
    } catch (error) {
      console.error("Error parsing response", error);
      return [];
    }
  };

  const getLpToTroRatio = async (
    proposalId: number,
    lpToken: string
  ): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getLpToTroRatio([proposalId, lpToken]);
    return handleQueryContract<string>(interaction);
  };

  const getVotingPower = async (
    user: string,
    proposalId?: number
  ): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getVotingPower([
      Address.fromBech32(user),
      proposalId,
    ]);
    return handleQueryContract<string>(interaction);
  };

  const getStakingContext = async (
    user?: string
  ): Promise<StakingContext | null> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getStakingContext([
      user ? Address.fromBech32(user) : undefined,
    ]);
    return handleQueryContract<StakingContext | null>(interaction);
  };

  const getUserCompleteStake = async (
    user: string
  ): Promise<EsdtTokenPayment[]> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUserCompleteStake([
      Address.fromBech32(user),
    ]);
    return handleQueryContract<EsdtTokenPayment[]>(interaction);
  };

  const getActiveProposalIds = async (): Promise<number[]> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getActiveProposalIds();
    return handleQueryContract<number[]>(interaction);
  };

  const getProposalStatus = async (
    proposalId: number
  ): Promise<ProposalStatus> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposalStatus([proposalId]);
    return handleQueryContract<ProposalStatus>(interaction);
  };

  // Write functions
  const stake = async (
    payments: Array<{ token: string; amount: BigNumber }>
  ) => {
    const contract = getTroStakingContract();
    const paymentsArg = payments.map(({ token, amount }) => {
      return TokenTransfer.fungibleFromBigInteger(token, amount);
    });

    const interaction = contract.methods
      .stake([])
      .withGasLimit(DEFAULT_GAS_LIMIT)
      .withMultiESDTNFTTransfer(paymentsArg);
    return handleSendTransaction(interaction);
  };

  const unstake = async (
    request: Array<{ token: string; amount: BigNumber }>
  ) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods
      .unstake(request)
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const vote = async (proposalId: number, decision: VoteDecision) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods
      .vote([proposalId, decision])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  // Admin functions
  const addWhitelistedLpTokens = async (lpTokenIdentifiers: string[]) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods
      .addWhitelistedLpTokens(lpTokenIdentifiers)
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const createProposal = async (
    title: string,
    description: string,
    minVotingPowerToValidateVote: BigNumber,
    startTime: number | undefined,
    endTime: number | undefined,
    lpToTroRatios: Array<{
      token: string;
      numerator: BigNumber;
      denominator: BigNumber;
    }>
  ) => {
    console.log("lpToTroRatios", [
      lpToTroRatios.map((r) => [r.token, r.numerator, r.denominator]),
    ]);
    const contract = getTroStakingContract();
    const interaction = contract.methods
      .createProposal([
        title,
        description,
        minVotingPowerToValidateVote,
        startTime,
        endTime,
        ...lpToTroRatios.map((r) => [r.token, r.numerator, r.denominator]),
      ])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  return {
    // Read functions
    getTroTokenIdentifier,
    getWhitelistedLpTokenIdentifiers,
    getUsersStake,
    getLastProposalId,
    getProposal,
    getProposalVotes,
    getUserVote,
    getLpToTroRatio,
    getVotingPower,
    getStakingContext,
    getUserCompleteStake,
    getActiveProposalIds,
    getProposalStatus,
    getFullProposalContext,

    // Write functions
    stake,
    unstake,
    vote,

    // Admin functions
    addWhitelistedLpTokens,
    createProposal,
  };
};

export default useTroStaking;
