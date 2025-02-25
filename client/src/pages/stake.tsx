import { useState } from "react";
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
import { getAccountNfts } from "@/api/mvx";

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
  const [selectedStaked, setSelectedStaked] = useState<Set<string>>(new Set());
  const [selectedWallet, setSelectedWallet] = useState<Set<string>>(new Set());
  const [stakedQuantities, setStakedQuantities] = useState<SelectedQuantity>(
    {}
  );
  const [walletQuantities, setWalletQuantities] = useState<SelectedQuantity>(
    {}
  );

  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const { getStakingInfo } = useNftStaking();

  const { data: stakedNftsData, isLoading: stakedNftsLoading } = useQuery<NFT[]>({
    queryKey: ["/api/users/1/nfts", "staked", address],
    enabled: isLoggedIn,
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const response = await fetch("/api/users/1/nfts");
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      const data = await response.json();
      return data.filter((nft: NFT) => nft.isStaked);
    }
  });

  const { data: walletNftsData, isLoading: walletNftsLoading } = useQuery<NFT[]>({
    queryKey: ["/api/users/1/nfts", "wallet", address],
    enabled: isLoggedIn,
    queryFn: async () => {
      if (!isLoggedIn) return [];
      console.log("Api nfts", await getAccountNfts(address));
      const response = await fetch("/api/users/1/nfts");
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      const data = await response.json();
      return data.filter((nft: NFT) => !nft.isStaked);
    }
  });

  const {
    data: stakingStats,
    isLoading: statsLoading,
  } = useQuery<StakingStats>({
    queryKey: ["stakingStats", { userId: address }],
    queryFn: async () => {
      if (!isLoggedIn) {
        return {
          totalStaked: 0,
          pendingRewards: "0",
          stakePower: 0,
        };
      }

      try {
        const stakingInfo = await getStakingInfo(address);
        return {
          totalStaked: stakingInfo.staked_items.length,
          pendingRewards: stakingInfo.pending_rewards
            .reduce(
              (acc, reward) => acc.plus(BigNumber(reward.amount).shiftedBy(-18)),
              BigNumber(0)
            )
            .toString(),
          stakePower: Number(stakingInfo.staked_score),
        };
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to fetch staking info"
        );
      }
    },
  });

  const isLoading = walletNftsLoading || stakedNftsLoading || statsLoading;

  const stakedNfts = stakedNftsData || [];
  const walletNfts = walletNftsData || [];

  const calculateSelectedSum = (
    nfts: NFT[],
    selected: Set<string>,
    quantities: SelectedQuantity
  ) => {
    return nfts
      .filter((nft) => selected.has(nft.tokenId))
      .reduce((sum, nft) => {
        const quantity = quantities[nft.tokenId] || 1;
        const isSFT = nft.metadata?.type === "SFT";
        const effectiveQuantity = isSFT ? quantity : 1;
        const yieldValue =
          typeof nft.stakingYield === "string"
            ? parseFloat(nft.stakingYield)
            : nft.stakingYield || 0;
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

  const renderNFTCard = (nft: NFT, isStaked: boolean) => {
    const isSFT = nft.metadata?.type === "SFT";
    const maxQuantity = isSFT ? nft.metadata?.quantity || 1 : 1;
    const quantities = isStaked ? stakedQuantities : walletQuantities;
    const selected = isStaked ? selectedStaked : selectedWallet;
    const currentQuantity = quantities[nft.tokenId] || 0;

    return (
      <div
        key={nft.id}
        className="flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Checkbox
            checked={selected.has(nft.tokenId)}
            onCheckedChange={(checked) => {
              if (checked) {
                const newSelected = new Set(selected);
                newSelected.add(nft.tokenId);
                if (isSFT) {
                  if (isStaked) {
                    setStakedQuantities({
                      ...stakedQuantities,
                      [nft.tokenId]: 1,
                    });
                  } else {
                    setWalletQuantities({
                      ...walletQuantities,
                      [nft.tokenId]: 1,
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
                newSelected.delete(nft.tokenId);
                if (isStaked) {
                  setSelectedStaked(newSelected);
                  const newQuantities = { ...stakedQuantities };
                  delete newQuantities[nft.tokenId];
                  setStakedQuantities(newQuantities);
                } else {
                  setSelectedWallet(newSelected);
                  const newQuantities = { ...walletQuantities };
                  delete newQuantities[nft.tokenId];
                  setWalletQuantities(newQuantities);
                }
              }
            }}
          />
          <div className="relative">
            <img
              src={`https://picsum.photos/seed/${nft.id}/100/100`}
              alt={`NFT ${nft.tokenId}`}
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
            />
            {isSFT && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-xs">
                x{maxQuantity}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              Token #{nft.tokenId}
            </h3>
            <div className="flex flex-wrap gap-1 md:gap-2 items-center mt-1">
              <Badge
                variant="outline"
                className="text-yellow-500 border-yellow-500/20 text-xs"
              >
                {parseFloat(nft.stakingYield || "0").toFixed(1)} Power
              </Badge>
              <Badge
                variant="outline"
                className="text-purple-500 border-purple-500/20 text-xs"
              >
                {nft.metadata?.type}
              </Badge>
            </div>
          </div>
        </div>
        {selected.has(nft.tokenId) && isSFT && (
          <div className="flex items-center gap-1 md:gap-2 ml-2">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 md:h-8 md:w-8"
              onClick={() =>
                handleQuantityChange(nft.tokenId, -1, maxQuantity, isStaked)
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
                handleQuantityChange(nft.tokenId, 1, maxQuantity, isStaked)
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
    ((stakingStats?.stakePower || 0) / TOTAL_STAKE_POWER) * 100;

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
                {userStakePercentage.toFixed(2)}% of total stake power
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
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staked NFTs */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Your Staked NFTs</CardTitle>
          {stakedNfts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStaked(
                    new Set(stakedNfts.map((nft) => nft.tokenId))
                  );
                  const newQuantities = {};
                  stakedNfts.forEach((nft) => {
                    if (nft.metadata?.type === "SFT") {
                      newQuantities[nft.tokenId] = nft.metadata?.quantity || 1;
                    }
                  });
                  setStakedQuantities(newQuantities);
                }}
              >
                Select All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedStaked.size === 0}
              >
                Unstake Selected ({stakedSum.toFixed(1)} Power)
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-4">
            {stakedNfts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  No NFTs staked yet. Add some NFTs from your wallet to start
                  earning rewards.
                </p>
              </div>
            ) : (
              stakedNfts.map((nft) => renderNFTCard(nft, true))
            )}
          </div>
        </CardContent>
      </Card>

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
                            new Set(walletNfts.map((nft) => nft.tokenId))
                          );
                          const newQuantities = {};
                          walletNfts.forEach((nft) => {
                            if (nft.metadata?.type === "SFT") {
                              newQuantities[nft.tokenId] = 1;
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
                          onClick={(e) => e.stopPropagation()}
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
                      new Set(walletNfts.map((nft) => nft.tokenId))
                    );
                    const newQuantities = {};
                    walletNfts.forEach((nft) => {
                      if (nft.metadata?.type === "SFT") {
                        newQuantities[nft.tokenId] = 1;
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
