import {
  IAddress,
  SmartContract,
  AbiRegistry,
  ProxyNetworkProvider,
  Interaction,
  ResultsParser,
} from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { getProviderUrl } from "../config";

const useContract = () => {
  const { network } = useGetNetworkConfig();

  const create = (abi: AbiRegistry, address: IAddress) => {
    return new SmartContract({
      address,
      abi,
    });
  };

  const getProvider = () => {
    return new ProxyNetworkProvider(getProviderUrl());
  };

  const handleQueryContract = async <T>(interaction: Interaction): Promise<T> => {
    const provider = getProvider();
    const result = await provider.queryContract(interaction.check().buildQuery());
    const data = new ResultsParser().parseQueryResponse(result, interaction.getEndpoint());
    return data as T;
  };

  const handleSendTransaction = async (interaction: Interaction) => {
    const provider = getProvider();
    return provider.sendTransaction(
      interaction.withChainID(network.chainID).check().buildTransaction()
    );
  };

  return {
    create,
    handleQueryContract,
    handleSendTransaction,
  };
};

export default useContract;
