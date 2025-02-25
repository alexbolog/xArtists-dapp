import useContract from "./useContract";
import abi from "../abis/tro-staking.abi.json";
import { AbiRegistry, Address, TokenTransfer } from "@multiversx/sdk-core/out";
import { BigNumber } from "bignumber.js";
import { getContractAddress } from "../config";

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
  const getTroTokenIdentifier = async () => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getTroTokenIdentifier();
    return handleQueryContract(interaction);
  };

  const getWhitelistedLpTokenIdentifiers = async () => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getWhitelistedLpTokenIdentifiers();
    return handleQueryContract(interaction);
  };

  const getUsersStake = async (usersAddress: string, tokenIdentifier: string) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUsersStake([
      Address.fromBech32(usersAddress),
      tokenIdentifier,
    ]);
    return handleQueryContract(interaction);
  };

  const getLastProposalId = async () => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getLastProposalId();
    return handleQueryContract(interaction);
  };

  const getProposal = async (proposalId: number) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposal([proposalId]);
    return handleQueryContract(interaction);
  };

  const getProposalVotes = async (proposalId: number, decision: string) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposalVotes([proposalId, decision]);
    return handleQueryContract(interaction);
  };

  const getUserVote = async (user: string, proposalId: number) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUserVote([
      Address.fromBech32(user),
      proposalId,
    ]);
    return handleQueryContract(interaction);
  };

  const getLpToTroRatio = async (proposalId: number, lpToken: string) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getLpToTroRatio([proposalId, lpToken]);
    return handleQueryContract(interaction);
  };

  const getVotingPower = async (user: string, proposalId?: number) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getVotingPower([
      Address.fromBech32(user),
      proposalId,
    ]);
    return handleQueryContract(interaction);
  };

  const getStakingContext = async (user?: string) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getStakingContext([
      user ? Address.fromBech32(user) : undefined,
    ]);
    return handleQueryContract(interaction);
  };

  const getUserCompleteStake = async (user: string) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getUserCompleteStake([
      Address.fromBech32(user),
    ]);
    return handleQueryContract(interaction);
  };

  const getActiveProposalIds = async () => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getActiveProposalIds();
    return handleQueryContract(interaction);
  };

  const getProposalStatus = async (proposalId: number) => {
    const contract = getTroStakingContract();
    const interaction = contract.methods.getProposalStatus([proposalId]);
    return handleQueryContract(interaction);
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

  const vote = async (proposalId: number, decision: string) => {
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
