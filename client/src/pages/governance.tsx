import { useState } from "react";
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
  Vote as VoteIcon
} from "lucide-react";
import type { Proposal } from "@shared/schema";
import CreateProposalModal from "@/components/create-proposal-modal";

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const totalVotes = Number(proposal.votesFor) + Number(proposal.votesAgainst);
  const forPercentage = totalVotes > 0
    ? (Number(proposal.votesFor) / totalVotes) * 100
    : 0;

  const getStatusConfig = () => {
    switch (proposal.status) {
      case 'active':
        return {
          color: 'bg-yellow-500/10',
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          text: 'Active Proposal',
          textColor: 'text-yellow-500'
        };
      case 'passed':
        return {
          color: 'bg-green-500/10',
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          text: 'Proposal Passed',
          textColor: 'text-green-500'
        };
      case 'rejected':
        return {
          color: 'bg-red-500/10',
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: 'Proposal Rejected',
          textColor: 'text-red-500'
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Demo user data - in a real app, this would come from auth context
  const userVotingPower = 100;
  const userPastVote = proposal.status !== 'active' ? 'for' : null;

  return (
    <Card
      className={`
        ${proposal.status === 'active' ? 'border-primary/50' : ''}
        ${proposal.status !== 'active' ? 'opacity-75' : ''}
      `}
    >
      <div className={`${statusConfig?.color} p-3 flex items-center gap-2 rounded-t-lg border-b`}>
        {statusConfig?.icon}
        <span className={`font-medium ${statusConfig?.textColor}`}>
          {statusConfig?.text}
        </span>
      </div>

      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-xl mb-1">{proposal.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Created by {proposal.creatorId}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{proposal.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Participation</span>
            <span className="font-medium">{totalVotes} votes</span>
          </div>
          <Progress value={forPercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span>{Number(proposal.votesFor).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span>{Number(proposal.votesAgainst).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {proposal.status === 'active' ? (
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
            <Button variant="outline" className="w-full gap-2" onClick={() => window.location.href = `/proposal/${proposal.id}`}>
              Show Vote Breakdown
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Governance() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: proposals, isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const activeProposals = proposals?.filter(p => p.status === 'active') || [];
  const pastProposals = proposals?.filter(p => p.status !== 'active') || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance</h1>
          <p className="text-muted-foreground">
            Vote on proposals and shape the future of the platform
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Create Proposal
        </Button>
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
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </div>
          )}

          {pastProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Proposals</h2>
              <div className="space-y-4">
                {pastProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </div>
          )}

          {!proposals?.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No active proposals at the moment
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  Create the First Proposal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}