import useContract from "./useContract";
import abi from "../abis/nft-staking.abi.json";
import { AbiRegistry, Address, TokenTransfer } from "@multiversx/sdk-core/out";
import { BigNumber } from "bignumber.js";
import { getContractAddress } from "../config";

const DEFAULT_GAS_LIMIT = 25_000_000;

const useNftStaking = () => {
  const CONTRACT_ADDRESS_KEY = "NFT_STAKING";
  const { create, handleQueryContract, handleSendTransaction } = useContract();

  // Utility functions
  const getNftStakingContract = () => {
    const address = getContractAddress(CONTRACT_ADDRESS_KEY);
    const abiRegistry = AbiRegistry.create(abi);
    return create(abiRegistry, Address.fromBech32(address));
  };

  // Read functions
  const getAllowedNftCollections = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getAllowedNftCollections();
    return handleQueryContract(interaction);
  };

  const getRewardTokenIds = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getRewardTokenIds();
    return handleQueryContract(interaction);
  };

  const getStakeQuantityRaw = async (
    address: string,
    tokenId: string,
    nonce: number
  ) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getStakeQuantityRaw([
      Address.fromBech32(address),
      tokenId,
      nonce,
    ]);
    return handleQueryContract(interaction);
  };

  const getStakedItemsRaw = async (address: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getStakedItemsRaw([
      Address.fromBech32(address),
    ]);
    return handleQueryContract(interaction);
  };

  const getNftCollectionScore = async (tokenId: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getNftCollectionScore([tokenId]);
    return handleQueryContract(interaction);
  };

  const getNftCollectionNonceScore = async (tokenId: string, nonce: number) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getNftCollectionNonceScore([
      tokenId,
      nonce,
    ]);
    return handleQueryContract(interaction);
  };

  const getStakingDisabled = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getStakingDisabled();
    return handleQueryContract(interaction);
  };

  const getUnstakingItemsRaw = async (address: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getUnstakingItemsRaw([
      Address.fromBech32(address),
    ]);
    return handleQueryContract(interaction);
  };

  const getUnstakingPenalty = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getUnstakingPenalty();
    return handleQueryContract(interaction);
  };

  const getStakingInfo = async (address: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getStakingInfo([
      Address.fromBech32(address),
    ]);
    return handleQueryContract(interaction);
  };

  const getPendingRewards = async (address: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getPendingRewards([
      Address.fromBech32(address),
    ]);
    return handleQueryContract(interaction);
  };

  const getStakedItems = async (address: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getStakedItems([
      Address.fromBech32(address),
    ]);
    return handleQueryContract(interaction);
  };

  const getUserStakingScore = async (address: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getUserStakingScore([
      Address.fromBech32(address),
    ]);
    return handleQueryContract(interaction);
  };

  const getAggregatedStakingScore = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getAggregatedStakingScore();
    return handleQueryContract(interaction);
  };

  const getLastDistributionRound = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getLastDistributionRound();
    return handleQueryContract(interaction);
  };

  const getRewardRate = async (tokenId: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods.getRewardRate([tokenId]);
    return handleQueryContract(interaction);
  };

  // Write functions
  const stakeNft = async (
    payments: [{ token: string; nonce: number; amount: number }]
  ) => {
    const contract = getNftStakingContract();
    const paymentsArg = payments.map(({ token, nonce, amount }) => {
      return TokenTransfer.semiFungible(token, nonce, amount);
    });

    const interaction = contract.methods
      .stakeNft([])
      .withGasLimit(DEFAULT_GAS_LIMIT)
      .withMultiESDTNFTTransfer(paymentsArg);
    return handleSendTransaction(interaction);
  };

  const unstakeNft = async (
    payments: [{ token: string; nonce: number; amount: number }]
  ) => {
    const contract = getNftStakingContract();
    const paymentsArg = payments.map(({ token, nonce, amount }) => {
      return TokenTransfer.semiFungible(token, nonce, amount);
    });

    const interaction = contract.methods
      .unstakeNft([paymentsArg])
      .withGasLimit(DEFAULT_GAS_LIMIT);

    return handleSendTransaction(interaction);
  };

  const claimRewards = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .claimRewards()
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const claimUnstaked = async () => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .claimUnstaked()
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  // Admin write functions
  const setStakingDisabled = async (disabled: boolean) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .setStakingDisabled([disabled])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const setUnstakingPenalty = async (penalty: number) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .setUnstakingPenalty([penalty])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const setNftCollectionScore = async (tokenId: string, score: number) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .setNftCollectionScore([tokenId, score])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const setNftCollectionNonceScore = async (
    tokenId: string,
    nonce: number,
    score: number
  ) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .setNftCollectionNonceScore([tokenId, nonce, score])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const addAllowedNftCollection = async (tokenId: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .addAllowedNftCollection([tokenId])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const removeAllowedNftCollection = async (tokenId: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .removeAllowedNftCollection([tokenId])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const setRewardTokenId = async (tokenId: string) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .setRewardTokenId([tokenId])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const setRewardRate = async (tokenId: string, rate: number) => {
    const contract = getNftStakingContract();
    const interaction = contract.methods
      .setRewardRate([tokenId, rate])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const distributeRewards = async (
    payments: Array<{ token: string; amount: BigNumber }>
  ) => {
    const contract = getNftStakingContract();
    const paymentsArg = payments.map(({ token, amount }) => {
      return TokenTransfer.fungibleFromBigInteger(token, amount);
    });

    const interaction = contract.methods
      .distributeRewards([])
      .withGasLimit(DEFAULT_GAS_LIMIT)
      .withMultiESDTNFTTransfer(paymentsArg);
    return handleSendTransaction(interaction);
  };

  return {
    getAllowedNftCollections,
    getRewardTokenIds,
    getStakeQuantityRaw,
    getStakedItemsRaw,
    getNftCollectionScore,
    getNftCollectionNonceScore,
    getStakingDisabled,
    getUnstakingItemsRaw,
    getUnstakingPenalty,
    getStakingInfo,
    getPendingRewards,
    getStakedItems,
    getUserStakingScore,
    getAggregatedStakingScore,
    getLastDistributionRound,
    getRewardRate,
    stakeNft,
    unstakeNft,
    claimRewards,
    claimUnstaked,
    setStakingDisabled,
    setUnstakingPenalty,
    setNftCollectionScore,
    setNftCollectionNonceScore,
    addAllowedNftCollection,
    removeAllowedNftCollection,
    setRewardTokenId,
    setRewardRate,
    distributeRewards,
  };
};

export default useNftStaking;
