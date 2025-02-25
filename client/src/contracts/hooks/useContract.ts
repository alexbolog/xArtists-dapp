import {
  IAddress,
  SmartContract,
  AbiRegistry,
  ProxyNetworkProvider,
  Interaction,
  ResultsParser,
  Address,
} from "@multiversx/sdk-core/out";
import {
  useGetAccountInfo,
  useGetNetworkConfig,
} from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { getProviderUrl } from "../config";

const useContract = () => {
  const { address } = useGetAccountInfo();
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

  const handleQueryContract = async <T>(
    interaction: Interaction
  ): Promise<T> => {
    const provider = getProvider();
    const result = await provider.queryContract(
      interaction.check().buildQuery()
    );
    const data = new ResultsParser()
      .parseQueryResponse(result, interaction.getEndpoint())
      .firstValue?.valueOf();
    return data as T;
  };

  const handleSendTransaction = async (interaction: Interaction) => {
    const tx = interaction
      .withSender(Address.fromBech32(address))
      .withChainID(network.chainId)
      .buildTransaction();
    await sendTransactions({
      transactions: [tx],
      redirectAfterSign: false,
    });
  };

  return {
    create,
    handleQueryContract,
    handleSendTransaction,
  };
};

export default useContract;
