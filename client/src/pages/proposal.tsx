import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Vote as VoteIcon,
  Users
} from "lucide-react";
import type { Proposal } from "@shared/schema";

// Mock voters data - in a real app, this would come from the API
const mockVoters = [
  { id: 1, name: "Alice", voteAmount: "500.00", voteType: "for" },
  { id: 2, name: "Bob", voteAmount: "300.00", voteType: "against" },
  { id: 3, name: "Charlie", voteAmount: "700.00", voteType: "for" },
  { id: 4, name: "Diana", voteAmount: "400.00", voteType: "against" },
];

function VoterCard({ voter }: { voter: typeof mockVoters[0] }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
            {voter.name[0]}
          </div>
        </Avatar>
        <div>
          <p className="font-medium">{voter.name}</p>
          <p className="text-sm text-muted-foreground">
            {Number(voter.voteAmount).toFixed(2)} tokens
          </p>
        </div>
      </div>
      <div className={`flex items-center gap-2 ${
        voter.voteType === 'for' ? 'text-green-500' : 'text-red-500'
      }`}>
        {voter.voteType === 'for' ? (
          <ThumbsUp className="h-4 w-4" />
        ) : (
          <ThumbsDown className="h-4 w-4" />
        )}
        <span className="font-medium capitalize">{voter.voteType}</span>
      </div>
    </div>
  );
}

export default function ProposalPage() {
  const { id } = useParams();
  
  const { data: proposal, isLoading } = useQuery<Proposal>({
    queryKey: [`/api/proposals/${id}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="h-48" />
        </Card>
      </div>
    );
  }

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

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

  return (
    <div className="space-y-8">
      <Card>
        <div className={`${statusConfig?.color} p-3 flex items-center gap-2 rounded-t-lg border-b`}>
          {statusConfig?.icon}
          <span className={`font-medium ${statusConfig?.textColor}`}>
            {statusConfig?.text}
          </span>
        </div>

        <CardHeader>
          <CardTitle className="text-2xl">{proposal.title}</CardTitle>
          <p className="text-muted-foreground">
            Created by {proposal.creatorId}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <p>{proposal.description}</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Votes For</p>
                      <p className="text-lg font-semibold">
                        {Number(proposal.votesFor).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Votes Against</p>
                      <p className="text-lg font-semibold">
                        {Number(proposal.votesAgainst).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Votes</p>
                      <p className="text-lg font-semibold">
                        {totalVotes.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Progress value={forPercentage} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-green-500 font-medium">
                  {forPercentage.toFixed(1)}% For
                </span>
                <span className="text-red-500 font-medium">
                  {(100 - forPercentage).toFixed(1)}% Against
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Votes</h3>
            <div className="space-y-2">
              {mockVoters.map((voter) => (
                <VoterCard key={voter.id} voter={voter} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
