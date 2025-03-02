import { Button } from "@/components/ui/button";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks/transactions";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import useFaucetContract from "@/contracts/hooks/useFaucetContract";
import { useLocation } from "wouter";
// import { useToast } from "@/hooks/use-toast";
// import { LoginButton } from "@/components/login-button";

export default function FaucetPage() {
  const { isLoggedIn } = useGetLoginInfo();
  const { claim } = useFaucetContract();
  const [, setLocation] = useLocation();

  const handleClaim = async () => {
    await claim();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-center">
          Connect to claim tokens
        </h1>
        <p className="text-muted-foreground text-center mb-4">
          You need to connect your wallet to claim tokens from the faucet.
        </p>
        <Button onClick={() => setLocation("/unlock")}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Token Faucet</h1>
        <p className="text-muted-foreground mb-8">
          Claim test tokens to interact with our dApp on the devnet (once every minute).
        </p>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleClaim} className="min-w-[200px]">
            Claim Tokens
          </Button>
        </div>
      </div>
    </div>
  );
}
