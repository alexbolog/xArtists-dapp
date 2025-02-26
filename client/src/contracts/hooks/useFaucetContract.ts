import useContract from "./useContract";
import abi from "../abis/simple-devnet-faucet.abi.json";
import { AbiRegistry, Address } from "@multiversx/sdk-core/out";
import { getContractAddress } from "../config";

const DEFAULT_GAS_LIMIT = 10_000_000;

const useFaucetContract = () => {
  const CONTRACT_ADDRESS_KEY = "FAUCET";
  const { create, handleSendTransaction } = useContract();

  // Utility functions
  const getFaucetContract = () => {
    const address = getContractAddress(CONTRACT_ADDRESS_KEY);
    const abiRegistry = AbiRegistry.create(abi);
    return create(abiRegistry, Address.fromBech32(address));
  };

  const claim = async () => {
    const contract = getFaucetContract();
    const interaction = contract.methods
      .claim([])
      .withGasLimit(DEFAULT_GAS_LIMIT);
    return handleSendTransaction(interaction);
  };

  return {
    claim,
  };
};

export default useFaucetContract; 