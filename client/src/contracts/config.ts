const getContractAddress = (contractName: string): string => {
  return process.env[`${contractName}_ADDRESS`] || "";
};

const getProviderUrl = (): string => {
  return process.env.PROVIDER_URL || "";
};
