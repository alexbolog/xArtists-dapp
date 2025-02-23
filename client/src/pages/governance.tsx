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
  PlusCircle 
} from "lucide-react";
import type { Proposal } from "@shared/schema";

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const totalVotes = Number(proposal.votesFor) + Number(proposal.votesAgainst);
  const forPercentage = totalVotes > 0 
    ? (Number(proposal.votesFor) / totalVotes) * 100 
    : 0;

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'active':
        return (
          <div className="flex items-center text-yellow-500">
            <Clock className="h-4 w-4 mr-1" />
            Active
          </div>
        );
      case 'passed':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Passed
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-500">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{proposal.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Created by {proposal.creatorId}
            </p>
          </div>
          {getStatusBadge()}
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

        {proposal.status === 'active' && (
          <div className="flex gap-2 mt-4">
            <Button variant="default" className="flex-1 gap-1">
              <ThumbsUp className="h-4 w-4" />
              Vote For
            </Button>
            <Button variant="outline" className="flex-1 gap-1">
              <ThumbsDown className="h-4 w-4" />
              Vote Against
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Governance() {
  const { data: proposals, isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance</h1>
          <p className="text-muted-foreground">
            Vote on proposals and shape the future of the platform
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Proposal
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {proposals?.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
          {!proposals?.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No active proposals at the moment
                </p>
                <Button>Create the First Proposal</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
