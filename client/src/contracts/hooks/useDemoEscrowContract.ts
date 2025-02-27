import useContract from "./useContract";
import abi from "../abis/demo-only-escrow.abi.json";
import {
  AbiRegistry,
  Address,
  Token,
  TokenTransfer,
} from "@multiversx/sdk-core/out";
import { getContractAddress } from "../config";

const DEFAULT_GAS_LIMIT = 10_000_000;

// Types based on the ABI
export type UserStatus = {
  ready_nonces: number[];
  user_address: string;
  locked_nonces: number[];
};

export type LockedNft = [Address, boolean]; // tuple<Address,bool> from ABI

const useDemoEscrowContract = () => {
  const CONTRACT_ADDRESS_KEY = "DEMO_ESCROW";
  const { create, handleSendTransaction, handleQueryContract } = useContract();

  // Utility functions
  const getDemoEscrowContract = () => {
    const address = getContractAddress(CONTRACT_ADDRESS_KEY);
    const abiRegistry = AbiRegistry.create(abi);
    return create(abiRegistry, Address.fromBech32(address));
  };

  // Contract interaction methods
  const lock = async (identifier: string, nonce: number) => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods
      .lock([])
      .withSingleESDTNFTTransfer(
        new TokenTransfer({
          token: new Token({
            identifier,
            nonce: BigInt(nonce),
          }),
          amount: BigInt(1),
        })
      )
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const update = async (
    nonce: number,
    name: string,
    royalties: number,
    hash: string,
    newAttributes: string,
    artworkUri: string,
    metadataUri: string
  ) => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods
      .update([
        nonce,
        Buffer.from(name).toString("hex"),
        royalties,
        Buffer.from(hash).toString("hex"),
        Buffer.from(newAttributes).toString("hex"),
        Buffer.from(artworkUri).toString("hex"),
        Buffer.from(metadataUri).toString("hex"),
      ])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const unlock = async (nonce: number) => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods
      .unlock([nonce])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  // View methods
  const getStatus = async (userAddress: string): Promise<UserStatus> => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods.getStatus([userAddress]);
    const { ready_nonces, user_address, locked_nonces } =
      await handleQueryContract<UserStatus>(interaction);
    return {
      ready_nonces: ready_nonces.map((nonce: any) => nonce.toNumber()),
      user_address: user_address.toString(),
      locked_nonces: locked_nonces.map((nonce: any) => nonce.toNumber()),
    };
  };

  const getDemoCollection = async (): Promise<string> => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods.getDemoCollection([]);
    return await handleQueryContract(interaction);
  };

  const getLockedNft = async (nonce: number): Promise<LockedNft> => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods.getLockedNft([nonce]);
    return await handleQueryContract(interaction);
  };

  const getAvailableUserNonces = async (
    userAddress: string
  ): Promise<number[]> => {
    const contract = getDemoEscrowContract();
    const interaction = contract.methods.getAvailableUserNonces([userAddress]);
    return await handleQueryContract(interaction);
  };

  return {
    lock,
    update,
    unlock,
    getStatus,
    getDemoCollection,
    getLockedNft,
    getAvailableUserNonces,
  };
};

export default useDemoEscrowContract;
