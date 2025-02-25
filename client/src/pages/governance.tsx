import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ChevronRight,
  Vote as VoteIcon,
} from "lucide-react";
import CreateProposalModal from "@/components/create-proposal-modal";
import useTroStaking from "@/contracts/hooks/useTroStaking";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { Proposal, ProposalContext, ProposalStatus } from "@/contracts/types";
import { ADMIN_ADDRESS } from "@/contracts/config";

function ProposalCard({ proposal }: { proposal: ProposalContext }) {
  console.log("proposalContext", proposal);

  const totalVotes = Number(proposal.proposal_vote_count);
  const forPercentage =
    totalVotes > 0
      ? (Number(proposal.proposal_vote_count.approve) / totalVotes) * 100
      : 0;

  const getStatusConfig = () => {
    console.log(
      "proposal.proposal_status",
      proposal.proposal_status,
      proposal.proposal_status === ProposalStatus.Pending
    );
    switch (proposal.proposal_status) {
      case ProposalStatus.Active:
        return {
          color: "bg-yellow-500/10",
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          text: "Active Proposal",
          textColor: "text-yellow-500",
        };
      case ProposalStatus.Pending: {
        return {
          color: "bg-gray-500/10",
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          text: "Upcoming Proposal",
          textColor: "text-gray-500",
        };
      }
      case ProposalStatus.Approved:
        return {
          color: "bg-green-500/10",
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          text: "Proposal Passed",
          textColor: "text-green-500",
        };
      case ProposalStatus.Rejected || ProposalStatus.Failed:
        return {
          color: "bg-red-500/10",
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: "Proposal Rejected",
          textColor: "text-red-500",
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Demo user data - in a real app, this would come from auth context
  const userVotingPower = 100;
  const userPastVote =
    proposal.proposal_status !== ProposalStatus.Active &&
    proposal.proposal_status !== ProposalStatus.Pending
      ? "for"
      : null;

  return (
    <Card
      className={`
        ${
          proposal.proposal_status === ProposalStatus.Active ||
          proposal.proposal_status === ProposalStatus.Pending
            ? "border-primary/50"
            : ""
        }
        ${
          proposal.proposal_status !== ProposalStatus.Active &&
          proposal.proposal_status !== ProposalStatus.Pending
            ? "opacity-75"
            : ""
        }
      `}
    >
      <div
        className={`${statusConfig?.color} p-3 flex items-center gap-2 rounded-t-lg border-b`}
      >
        {statusConfig?.icon}
        <span className={`font-medium ${statusConfig?.textColor}`}>
          {statusConfig?.text}
        </span>
      </div>

      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-xl mb-1">
            {proposal.proposal.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Created by {proposal.proposal.creator.toString()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{proposal.proposal.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Participation</span>
            <span className="font-medium">
              {Number.isNaN(totalVotes) ? "0" : totalVotes} votes
            </span>
          </div>
          <Progress value={forPercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span>
                {Number(proposal.proposal_vote_count.approve).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span>
                {Number(proposal.proposal_vote_count?.reject ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {proposal.proposal_status === ProposalStatus.Active ? (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 text-sm mb-2">
                <VoteIcon className="h-4 w-4 text-primary" />
                <span>Your Voting Power</span>
              </div>
              <p className="font-semibold">{userVotingPower} tokens</p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" className="flex-1 gap-1">
                <ThumbsUp className="h-4 w-4" />
                Vote For
              </Button>
              <Button variant="outline" className="flex-1 gap-1">
                <ThumbsDown className="h-4 w-4" />
                Vote Against
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {userPastVote && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <VoteIcon className="h-4 w-4" />
                  <span>You voted {userPastVote}</span>
                </div>
              </div>
            )}
            {proposal.proposal_status !== ProposalStatus.Pending ? (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() =>
                  (window.location.href = `/proposal/${proposal.proposal.id}`)
                }
              >
                Show Vote Breakdown
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" className="w-full gap-2">
                <span>
                  Starts at{" "}
                  {new Date(proposal.proposal.start_time).toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                    }
                  )}{" "}
                  UTC
                </span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Governance() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { address } = useGetAccountInfo();
  const { getFullProposalContext } = useTroStaking();

  const { data: proposals, isLoading } = useQuery<ProposalContext[]>({
    queryKey: ["proposals", address],
    queryFn: () => getFullProposalContext(address),
  });

  const activeProposals =
    proposals?.filter((p) => p.proposal_status === ProposalStatus.Active) || [];
  const pastProposals =
    proposals?.filter((p) => p.proposal_status !== ProposalStatus.Active) || [];

  console.log("activeProposals", activeProposals);
  console.log("pastProposals", pastProposals);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance</h1>
          <p className="text-muted-foreground">
            Vote on proposals and shape the future of the platform
          </p>
        </div>
        {ADMIN_ADDRESS === address && (
          <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Create Proposal
          </Button>
        )}
      </div>

      <CreateProposalModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {activeProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Proposals</h2>
              <div className="space-y-4">
                {activeProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.proposal.id}
                    proposal={proposal}
                  />
                ))}
              </div>
            </div>
          )}

          {pastProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Proposals</h2>
              <div className="space-y-4">
                {pastProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.proposal.id}
                    proposal={proposal}
                  />
                ))}
              </div>
            </div>
          )}

          {!proposals?.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No active proposals at the moment
                </p>
                {ADMIN_ADDRESS === address && (
                  <Button onClick={() => setCreateModalOpen(true)} className="mt-4">
                    Create the First Proposal
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
