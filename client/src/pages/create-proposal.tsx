import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertProposalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Mock list of available tokens - in production this would come from an API
const AVAILABLE_TOKENS = [
  { id: "gov", name: "Governance Token (GOV)" },
  { id: "stake", name: "Staking Token (STAKE)" },
  { id: "art", name: "Art Token (ART)" },
];

// Mock total voting power - in production this would come from the API
const TOTAL_VOTING_POWER = 10000;

export default function CreateProposal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [minVotingPowerPercent, setMinVotingPowerPercent] = useState<number>(10);

  const form = useForm({
    resolver: zodResolver(insertProposalSchema),
    defaultValues: {
      title: "",
      description: "",
      creatorId: 1, // Demo user ID
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      minVotingPower: (TOTAL_VOTING_POWER * 0.1).toString(), // 10% default
      eligibleTokens: [],
    },
  });

  const createProposal = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/proposals", {
        ...data,
        eligibleTokens: selectedTokens,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Proposal created successfully",
      });
      setLocation("/governance");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create proposal",
        variant: "destructive",
      });
    },
  });

  const toggleToken = (tokenId: string) => {
    setSelectedTokens(current =>
      current.includes(tokenId)
        ? current.filter(id => id !== tokenId)
        : [...current, tokenId]
    );
  };

  const handleSliderChange = (value: number[]) => {
    const percent = value[0];
    setMinVotingPowerPercent(percent);
    form.setValue("minVotingPower", Math.floor(TOTAL_VOTING_POWER * (percent / 100)).toString());
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Proposal</h1>

      <Card className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createProposal.mutate(data))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter proposal title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your proposal"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date & Time</FormLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormControl>
                        <Input
                          type="time"
                          className="w-[140px]"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date & Time</FormLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < field.value || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormControl>
                        <Input
                          type="time"
                          className="w-[140px]"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minVotingPower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Voting Power Required</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Slider
                        value={[minVotingPowerPercent]}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{minVotingPowerPercent}% of total voting power</span>
                        <span>{Math.floor(TOTAL_VOTING_POWER * (minVotingPowerPercent / 100))} tokens</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eligibleTokens"
              render={() => (
                <FormItem>
                  <FormLabel>Eligible Tokens</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {AVAILABLE_TOKENS.map((token) => (
                        <div key={token.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedTokens.includes(token.id)}
                            onCheckedChange={() => toggleToken(token.id)}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {token.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createProposal.isPending}
            >
              {createProposal.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </div>
              ) : (
                "Create Proposal"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}