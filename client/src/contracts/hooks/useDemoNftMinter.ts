import useContract from "./useContract";
import abi from "../abis/demo-only-nft-minter.abi.json";
import {
  AbiRegistry,
  Address,
  Token,
  TokenTransfer,
} from "@multiversx/sdk-core/out";
import { BigNumber } from "bignumber.js";
import { getContractAddress, TRO_TOKEN_ID } from "../config";
import { CreateNftArgs, NftForSale, OptionalPriceTag } from "../types";

const DEFAULT_GAS_LIMIT = 25_000_000;

const useDemoNftMinter = () => {
  const CONTRACT_ADDRESS_KEY = "DEMO_NFT_MINTER";
  const { create, handleQueryContract, handleSendTransaction } = useContract();

  // Utility functions
  const getDemoNftMinterContract = () => {
    const address = getContractAddress(CONTRACT_ADDRESS_KEY);
    const abiRegistry = AbiRegistry.create(abi);
    return create(abiRegistry, Address.fromBech32(address));
  };

  // Read functions
  const getNftPrice = async (
    nftNonce: number
  ): Promise<OptionalPriceTag | null> => {
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods.getNftPrice([nftNonce]);
    return handleQueryContract<OptionalPriceTag | null>(interaction);
  };

  const getAllNftsForSale = async (): Promise<NftForSale[]> => {
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods.getAllNftsForSale();
    return handleQueryContract<NftForSale[]>(interaction);
  };

  const getNftsForSaleMap = async (): Promise<Record<string, string>> => {
    const nftsForSale = await getAllNftsForSale();
    const rec: Record<string, string> = {};
    nftsForSale.forEach((nft) => {
      rec[nft.nft_nonce.toString()] = nft.price_tag.amount;
    });

    return rec;
  };

  // Write functions
  const createNft = async ({
    name,
    royalties,
    attributes,
    asset_uri,
    metadata_uri,
    selling_price,
    opt_token_used_as_payment,
    opt_token_used_as_payment_nonce,
  }: CreateNftArgs) => {
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods
      .createNft([
        name,
        royalties,
        attributes,
        asset_uri,
        metadata_uri,
        selling_price,
        opt_token_used_as_payment,
        opt_token_used_as_payment_nonce,
      ])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const buyNft = async (
    nftNonce: number,
    paymentToken: string,
    paymentAmount: string
  ) => {
    const payment = new TokenTransfer({
      token: new Token({ identifier: paymentToken }),
      amount: BigInt(paymentAmount),
    });
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods
      .buyNft([nftNonce])
      .withGasLimit(DEFAULT_GAS_LIMIT);

    if (payment) {
      interaction.withSingleESDTTransfer(payment);
    }

    return handleSendTransaction(interaction);
  };

  // Admin functions
  const issueToken = async (
    tokenName: string,
    tokenTicker: string,
    issuePrice: BigNumber
  ) => {
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods
      .issueToken([tokenName, tokenTicker])
      .withValue(issuePrice)
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const setLocalRoles = async () => {
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods
      .setLocalRoles([])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  const claimRoyaltiesFromMarketplace = async (
    marketplaceAddress: string,
    tokenId: string,
    tokenNonce: number
  ) => {
    const contract = getDemoNftMinterContract();
    const interaction = contract.methods
      .claimRoyaltiesFromMarketplace([
        Address.fromBech32(marketplaceAddress),
        tokenId,
        tokenNonce,
      ])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  return {
    // Read functions
    getNftPrice,
    getAllNftsForSale,

    // Write functions
    createNft,
    buyNft,

    // Admin functions
    issueToken,
    setLocalRoles,
    claimRoyaltiesFromMarketplace,

    // Utility functions
    getNftsForSaleMap,
  };
};

export default useDemoNftMinter;
