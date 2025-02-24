import {
  IAddress,
  SmartContract,
  AbiRegistry,
  ProxyNetworkProvider,
  Interaction,
} from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";

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

  const handleQueryContract = async (interaction: Interaction) => {
    const provider = getProvider();
    return provider.queryContract(interaction.check().buildQuery());
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
