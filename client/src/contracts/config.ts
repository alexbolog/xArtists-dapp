const getContractAddress = (contractName: string): string => {
  return import.meta.env[`VITE_SC_ADDRESS_${contractName}`] || "";
};

const getProviderUrl = (): string => {
  return import.meta.env.VITE_PROVIDER_URL || "";
};

const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || "";
};

const getChainId = (): string => {
  return import.meta.env.VITE_CHAIN_ID || "";
};

export { getContractAddress, getProviderUrl, getChainId, getApiUrl };
