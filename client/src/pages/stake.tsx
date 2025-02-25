import { useEffect, useState } from "react";
import { QueryFunction, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  Wallet,
  Trophy,
  ArrowUpFromLine,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { NFT } from "@shared/schema";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import useNftStaking from "@/contracts/hooks/useNftStaking";
import BigNumber from "bignumber.js";
import { ApiNft, getAccountNfts } from "@/api/mvx";
import { getContractAddress } from "@/contracts/config";
import { formatDistanceToNow } from "date-fns";

// Mock data - in production these would come from the API
const TOTAL_STAKE_POWER = 100000;
const TOTAL_REWARDS_DISTRIBUTED = 75; // 75%

interface StakingStats {
  totalStaked: number;
  pendingRewards: string;
  stakePower: number;
}

interface SelectedQuantity {
  [tokenId: string]: number;
}

export default function StakePage() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [stakedOpen, setStakedOpen] = useState(false);
  const [selectedStaked, setSelectedStaked] = useState<Set<string>>(new Set());
  const [selectedWallet, setSelectedWallet] = useState<Set<string>>(new Set());
  const [stakedQuantities, setStakedQuantities] = useState<SelectedQuantity>(
    {}
  );
  const [walletQuantities, setWalletQuantities] = useState<SelectedQuantity>(
    {}
  );
  const [hasUnbondedNfts, setHasUnbondedNfts] = useState(false);

  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const { getStakingInfo, stakeNft, unstakeNft, claimUnstaked, claimRewards } =
    useNftStaking();

  // Create a base query for staking info
  const { data: stakingInfo, isLoading: stakingInfoLoading } = useQuery({
    queryKey: ["stakingInfo", address],
    queryFn: async () => {
      if (!isLoggedIn) {
        return {
          staked_items: [],
          pending_rewards: [],
          staked_score: "0",
          aggregated_staked_score: "0",
          unstaking_items: [],
        };
      }
      const apiInfo = await getStakingInfo(address);
      console.log("apiInfo", apiInfo);
      return apiInfo;
    },
  });

  // Use staked items from the same staking info
  const { data: stakedNftsData, isLoading: stakedNftsLoading } = useQuery<{
    stakedNfts: ApiNft[];
    unbondingNfts: ApiNft[];
  }>({
    queryKey: ["stakingInfo", address, "nfts"],
    enabled: !!stakingInfo,
    staleTime: Infinity,
    queryFn: async () => {
      if (!stakingInfo) return { stakedNfts: [], unbondingNfts: [] };

      const allStakedNfts = await getAccountNfts(
        getContractAddress("NFT_STAKING")
      );

      // Get currently staked NFTs
      const stakedNfts = allStakedNfts
        .filter((nft) =>
          stakingInfo?.staked_items.some(
            (item) =>
              item.token_identifier === nft.collection &&
              parseInt(item.token_nonce.toString()) === nft.nonce
          )
        )
        .map((nft) => ({
          ...nft,
          balance: stakingInfo?.staked_items
            .find(
              (item) =>
                item.token_identifier === nft.collection &&
                parseInt(item.token_nonce.toString()) === nft.nonce
            )
            ?.amount.toString(),
        }));

      // Get unbonding NFTs from all batches
      const unbondingNfts = allStakedNfts
        .filter((nft) =>
          stakingInfo?.unstaking_items?.some((batch) =>
            batch.unstake_items.some(
              (item) =>
                item.token_identifier === nft.collection &&
                parseInt(item.token_nonce.toString()) === nft.nonce
            )
          )
        )
        .map((nft) => {
          const batch = stakingInfo?.unstaking_items?.find((batch) =>
            batch.unstake_items.some(
              (item) =>
                item.token_identifier === nft.collection &&
                parseInt(item.token_nonce.toString()) === nft.nonce
            )
          );
          const unbondingTimestamp = parseInt(
            batch?.unstake_timestamp.toString() || "0"
          );

          if (unbondingTimestamp + 7 * 24 * 60 * 60 < Date.now() / 1000) {
            setHasUnbondedNfts(true);
          }

          return {
            ...nft,
            balance: batch?.unstake_items
              .find(
                (item) =>
                  item.token_identifier === nft.collection &&
                  parseInt(item.token_nonce.toString()) === nft.nonce
              )
              ?.amount.toString(),
            unstakingTimestamp: parseInt(
              batch?.unstake_timestamp.toString() || "0"
            ),
          };
        });

      return { stakedNfts, unbondingNfts };
    },
  });

  const { data: walletNftsData, isLoading: walletNftsLoading } = useQuery<
    ApiNft[]
  >({
    queryKey: [`/api/users/${address}/nfts`, "wallet", address],
    enabled: isLoggedIn,
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const response = await getAccountNfts(address);
      return response;
    },
  });

  // Derive stats from the staking info
  const { data: stakingStats, isLoading: statsLoading } =
    useQuery<StakingStats>({
      queryKey: ["stakingInfo", address, "stats"],
      enabled: !!stakingInfo,
      staleTime: Infinity, // Optional: prevent unnecessary refetches
      queryFn: () => ({
        totalStaked:
          stakingInfo?.staked_items.reduce(
            (acc, item) => acc + parseInt(item.amount),
            0
          ) || 0,
        pendingRewards: (
          stakingInfo?.pending_rewards.reduce(
            (acc, reward) => acc.plus(BigNumber(reward.amount).shiftedBy(-18)),
            BigNumber(0)
          ) || 0
        ).toString(),
        stakePower:
          Number(stakingInfo?.staked_score.toString() || "0") / 10 ** 6,
      }),
    });

  const isLoading = walletNftsLoading || stakedNftsLoading || statsLoading;

  const stakedNfts = stakedNftsData?.stakedNfts || [];
  const unbondingNfts = stakedNftsData?.unbondingNfts || [];
  const walletNfts = walletNftsData || [];

  const calculateSelectedSum = (
    nfts: ApiNft[],
    selected: Set<string>,
    quantities: SelectedQuantity
  ) => {
    return nfts
      .filter((nft) => selected.has(nft.identifier))
      .reduce((sum, nft) => {
        const quantity = quantities[nft.identifier] || 1;
        const isSFT = nft.type === "SemiFungibleESDT";
        const effectiveQuantity = isSFT ? quantity : 1;
        const yieldValue = 1; // Default yield or calculate from nft properties
        return sum + yieldValue * effectiveQuantity;
      }, 0);
  };

  const stakedSum = calculateSelectedSum(
    stakedNfts,
    selectedStaked,
    stakedQuantities
  );
  const walletSum = calculateSelectedSum(
    walletNfts,
    selectedWallet,
    walletQuantities
  );

  const handleQuantityChange = (
    tokenId: string,
    delta: number,
    maxQuantity: number,
    isStaked: boolean
  ) => {
    const quantities = isStaked ? stakedQuantities : walletQuantities;
    const setQuantities = isStaked ? setStakedQuantities : setWalletQuantities;
    const selected = isStaked ? selectedStaked : selectedWallet;
    const setSelected = isStaked ? setSelectedStaked : setSelectedWallet;

    const currentQty = quantities[tokenId] || 0;
    const newQty = Math.max(0, Math.min(currentQty + delta, maxQuantity));

    if (newQty === 0) {
      // Remove from selection if quantity is 0
      const newSelected = new Set(selected);
      newSelected.delete(tokenId);
      setSelected(newSelected);
      const newQuantities = { ...quantities };
      delete newQuantities[tokenId];
      setQuantities(newQuantities);
    } else {
      // Add to selection and update quantity
      if (!selected.has(tokenId)) {
        const newSelected = new Set(selected);
        newSelected.add(tokenId);
        setSelected(newSelected);
      }
      setQuantities({ ...quantities, [tokenId]: newQty });
    }
  };

  const renderNFTCard = (nft: ApiNft, isStaked: boolean) => {
    const isSFT = nft.type === "SemiFungibleESDT";
    const maxQuantity = isSFT ? parseInt(nft.balance) || 1 : 1;
    const quantities = isStaked ? stakedQuantities : walletQuantities;
    const selected = isStaked ? selectedStaked : selectedWallet;
    const currentQuantity = quantities[nft.identifier] || 0;
    return (
      <div
        key={nft.identifier}
        className={`flex items-center justify-between p-3 md:p-4 border rounded-lg transition-colors ${
          nft.unstakingTimestamp ? "bg-muted/20" : "hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Checkbox
            checked={selected.has(nft.identifier)}
            disabled={!!nft.unstakingTimestamp}
            onCheckedChange={(checked) => {
              if (checked) {
                const newSelected = new Set(selected);
                newSelected.add(nft.identifier);
                if (isSFT) {
                  if (isStaked) {
                    setStakedQuantities({
                      ...stakedQuantities,
                      [nft.identifier]: 1,
                    });
                  } else {
                    setWalletQuantities({
                      ...walletQuantities,
                      [nft.identifier]: 1,
                    });
                  }
                }
                if (isStaked) {
                  setSelectedStaked(newSelected);
                } else {
                  setSelectedWallet(newSelected);
                }
              } else {
                const newSelected = new Set(selected);
                newSelected.delete(nft.identifier);
                if (isStaked) {
                  setSelectedStaked(newSelected);
                  const newQuantities = { ...stakedQuantities };
                  delete newQuantities[nft.identifier];
                  setStakedQuantities(newQuantities);
                } else {
                  setSelectedWallet(newSelected);
                  const newQuantities = { ...walletQuantities };
                  delete newQuantities[nft.identifier];
                  setWalletQuantities(newQuantities);
                }
              }
            }}
          />
          <div className="relative">
            <img
              src={
                nft.url ||
                `https://picsum.photos/seed/${nft.identifier}/100/100`
              }
              alt={`NFT ${nft.identifier}`}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover ${
                nft.unstakingTimestamp ? "opacity-50" : ""
              }`}
            />
            {isSFT && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-xs">
                x{maxQuantity}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              {nft.name || `Token #${nft.identifier}`}
            </h3>
            <div className="flex flex-wrap gap-1 md:gap-2 items-center mt-1">
              {nft.unstakingTimestamp ? (
                <Badge
                  variant="secondary"
                  className="text-muted-foreground text-xs"
                >
                  Unbonding until{" "}
                  {new Date(
                    nft.unstakingTimestamp * 1000 + 7 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-yellow-500 border-yellow-500/20 text-xs"
                >
                  {1.0} Power
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-purple-500 border-purple-500/20 text-xs"
              >
                {nft.type}
              </Badge>
            </div>
          </div>
        </div>
        {selected.has(nft.identifier) && isSFT && (
          <div className="flex items-center gap-1 md:gap-2 ml-2">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 md:h-8 md:w-8"
              onClick={() =>
                handleQuantityChange(nft.identifier, -1, maxQuantity, isStaked)
              }
              disabled={currentQuantity <= 1}
            >
              <Minus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <span className="w-6 md:w-8 text-center text-sm">
              {currentQuantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 md:h-8 md:w-8"
              onClick={() =>
                handleQuantityChange(nft.identifier, 1, maxQuantity, isStaked)
              }
              disabled={currentQuantity >= maxQuantity}
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  const userStakePercentage =
    ((stakingStats?.stakePower || 0) /
      (parseFloat(stakingInfo?.staked_score || "0") / 10 ** 6)) *
    100;

  const handleStakeSelected = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    console.log("selectedWallet", selectedWallet);
    await stakeNft(
      Array.from(selectedWallet).map((identifier: string) => ({
        token: `${identifier.split("-")[0]}-${identifier.split("-")[1]}`,
        nonce: parseInt(identifier.split("-")[2], 16),
        amount: walletQuantities[identifier] || 1,
      }))
    );
  };

  const handleUnstakeSelected = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    console.log("selectedStaked", selectedStaked, stakedQuantities);

    try {
      await unstakeNft(
        Array.from(selectedStaked).map((identifier: string) => {
          const [collection, ticker, nonce] = identifier.split("-");
          return {
            token: `${collection}-${ticker}`,
            nonce: parseInt(nonce), // Convert string nonce to number
            amount: stakedQuantities[identifier] || 1,
          };
        })
      );

      // Clear selections after successful unstake
      setSelectedStaked(new Set());
      setStakedQuantities({});
    } catch (error) {
      console.error("Unstaking failed:", error);
    }
  };

  const handleClaimUnstakedNfts = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    await claimUnstaked();
  };

  const handleClaimRewards = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await claimRewards();
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Staking Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Staked NFTs
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stakingStats?.totalStaked}
            </div>
            <p className="text-xs text-muted-foreground">
              Stake more NFTs to earn higher rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Stake Power
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stakingStats?.stakePower.toLocaleString()}
            </div>
            <div className="mt-2">
              <Progress value={userStakePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {(Number.isNaN(userStakePercentage)
                  ? 0
                  : userStakePercentage
                ).toFixed(2)}
                % of total stake power
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Rewards
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stakingStats?.pendingRewards} TRO
            </div>
            <Button
              size="sm"
              className="mt-2 w-full bg-green-500 hover:bg-green-600"
              disabled={stakingStats?.pendingRewards === "0"}
              onClick={handleClaimRewards}
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staked NFTs */}
      <Collapsible open={stakedOpen} onOpenChange={setStakedOpen}>
        <Card>
          <CardHeader className="border-b">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle>Your Staked NFTs</CardTitle>
                <div className="flex items-center gap-4">
                  {stakedNfts.length > 0 && stakedOpen && (
                    <div className="hidden sm:flex items-center gap-2">
                      {unbondingNfts.length > 0 && hasUnbondedNfts && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClaimUnstakedNfts}
                        >
                          Claim Unbonding NFTs
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStaked(
                            new Set(stakedNfts.map((nft) => nft.identifier))
                          );
                          const newQuantities = {};
                          stakedNfts.forEach((nft) => {
                            if (nft.type === "SemiFungibleESDT") {
                              newQuantities[nft.identifier] =
                                parseInt(nft.balance) || 1;
                            }
                          });
                          setStakedQuantities(newQuantities);
                        }}
                      >
                        Select All
                      </Button>
                      {selectedStaked.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={selectedStaked.size === 0}
                          onClick={handleUnstakeSelected}
                        >
                          Unstake Selected ({stakedSum.toFixed(1)} Power)
                        </Button>
                      )}
                    </div>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      stakedOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-2 md:space-y-4 gap-2 mt-4">
                {stakedNfts.length === 0 && unbondingNfts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No NFTs staked yet. Add some NFTs from your wallet to
                      start earning rewards.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active staked NFTs */}
                    {stakedNfts.map((nft) => renderNFTCard(nft, true))}

                    {/* Unbonding NFTs */}
                    {unbondingNfts.map((nft) => renderNFTCard(nft, true))}
                  </>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Wallet NFTs */}
      <Collapsible open={walletOpen} onOpenChange={setWalletOpen}>
        <Card>
          <CardHeader className="border-b">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle>Available NFTs in Wallet</CardTitle>
                <div className="flex items-center gap-4">
                  {walletNfts.length > 0 && walletOpen && (
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWallet(
                            new Set(walletNfts.map((nft) => nft.identifier))
                          );
                          const newQuantities = {};
                          walletNfts.forEach((nft) => {
                            if (nft.type === "SemiFungibleESDT") {
                              newQuantities[nft.identifier] =
                                parseInt(nft.balance) || 1;
                            }
                          });
                          setWalletQuantities(newQuantities);
                        }}
                      >
                        Select All
                      </Button>
                      {selectedWallet.size > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          disabled={selectedWallet.size === 0}
                          onClick={handleStakeSelected}
                        >
                          Stake Selected ({walletSum.toFixed(1)} Power)
                        </Button>
                      )}
                    </div>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      walletOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </CollapsibleTrigger>
            {walletNfts.length > 0 && walletOpen && (
              <div className="sm:hidden flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWallet(
                      new Set(walletNfts.map((nft) => nft.identifier))
                    );
                    const newQuantities = {};
                    walletNfts.forEach((nft) => {
                      if (nft.type === "SemiFungibleESDT") {
                        newQuantities[nft.identifier] = 1;
                      }
                    });
                    setWalletQuantities(newQuantities);
                  }}
                >
                  Select All
                </Button>
                {selectedWallet.size > 0 && (
                  <>
                    <div className="text-xs text-muted-foreground">
                      Selected NFTs: {Array.from(selectedWallet).length}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled={selectedWallet.size === 0}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Stake Selected ({walletSum.toFixed(1)} Power)
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="space-y-2 md:space-y-4">
                {walletNfts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No NFTs available in your wallet</p>
                  </div>
                ) : (
                  walletNfts.map((nft) => renderNFTCard(nft, false))
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
