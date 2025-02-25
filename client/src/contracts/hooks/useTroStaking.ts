import useContract from "./useContract";
import abi from "../abis/tro-staking.abi.json";
import { AbiRegistry, Address, TokenTransfer } from "@multiversx/sdk-core/out";
import { BigNumber } from "bignumber.js";
import { getContractAddress } from "../config";
import {
  EsdtTokenPayment,
  Proposal,
  ProposalContext,
  ProposalStatus,
  StakingContext,
  VoteContext,
  VoteDecision
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

  const getUsersStake = async (usersAddress: string, tokenIdentifier: string): Promise<string> => {
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

  const getProposalVotes = async (proposalId: number, decision: VoteDecision): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposalVotes([proposalId, decision]);
    return handleQueryContract<string>(interaction);
  };

  const getUserVote = async (user: string, proposalId: number): Promise<VoteContext> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUserVote([
      Address.fromBech32(user),
      proposalId,
    ]);
    return handleQueryContract<VoteContext>(interaction);
  };

  const getLpToTroRatio = async (proposalId: number, lpToken: string): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getLpToTroRatio([proposalId, lpToken]);
    return handleQueryContract<string>(interaction);
  };

  const getVotingPower = async (user: string, proposalId?: number): Promise<string> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getVotingPower([
      Address.fromBech32(user),
      proposalId,
    ]);
    return handleQueryContract<string>(interaction);
  };

  const getStakingContext = async (user?: string): Promise<StakingContext | null> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getStakingContext([
      user ? Address.fromBech32(user) : undefined,
    ]);
    return handleQueryContract<StakingContext | null>(interaction);
  };

  const getUserCompleteStake = async (user: string): Promise<EsdtTokenPayment[]> => {
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

  const getProposalStatus = async (proposalId: number): Promise<ProposalStatus> => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposalStatus([proposalId]);
    return handleQueryContract<ProposalStatus>(interaction);
  };

  // Write functions
  const stake = async (payments: Array<{ token: string; amount: BigNumber }>) => {
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

  const unstake = async (request: Array<{ token: string; amount: BigNumber }>) => {
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
    lpToTroRatios: Array<{ token: string; numerator: BigNumber; denominator: BigNumber }>
  ) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods
      .createProposal([
        title,
        description,
        minVotingPowerToValidateVote,
        startTime,
        endTime,
        lpToTroRatios,
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
