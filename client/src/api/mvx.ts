import { getApiUrl } from "@/contracts/config";

export const getAccountNfts = async (address: string) => {
    const response = await fetch(`${getApiUrl()}/accounts/${address}/nfts`);
    if (!response.ok) {
        throw new Error("Failed to fetch NFTs");
    }
    return response.json();
}