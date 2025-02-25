import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertProposalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
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
import useTroStaking from "@/contracts/hooks/useTroStaking";
import { getTokens, getTokenSupply, TokenSupply } from "@/api/mvx";

// Mock list of available tokens - in production this would come from an API
const AVAILABLE_TOKENS = [
  { id: "TROLP1-2990e5", name: "TRO LP 1" },
  { id: "TROLP2-291180", name: "TRO LP 2" },
];

const TRO_TOKEN_ID = "TRO-9003a7";

interface CreateProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProposalModal({
  open,
  onOpenChange,
}: CreateProposalModalProps) {
  const { createProposal } = useTroStaking();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [minVotingPowerPercent, setMinVotingPowerPercent] =
    useState<number>(10);

  const { data: eligibleTokenSupplies } = useQuery({
    queryKey: ["eligibleTokenSupplies"],
    queryFn: async () => {
      let supplies: { [key: string]: TokenSupply } = {};
      const identifiers = AVAILABLE_TOKENS.map((token) => token.id).concat([
        TRO_TOKEN_ID,
      ]);
      for (const identifier of identifiers) {
        const supply = await getTokenSupply(identifier);
        supplies[identifier] = supply;
      }
      return supplies;
    },
  });

  const totalVotingPower = useMemo(() => {
    if (!eligibleTokenSupplies) return 0;

    // TRO token is always included
    let total = BigInt(
      eligibleTokenSupplies[TRO_TOKEN_ID]?.circulatingSupply || 0
    );

    // Add selected LP tokens
    selectedTokens.forEach((tokenId) => {
      total += BigInt(eligibleTokenSupplies[tokenId]?.circulatingSupply || 0);
    });

    return Number(total);
  }, [eligibleTokenSupplies, selectedTokens]);

  const form = useForm({
    resolver: zodResolver(insertProposalSchema),
    defaultValues: {
      title: "",
      description: "",
      creatorId: 1,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      minVotingPower: (totalVotingPower * 0.1).toString(),
      eligibleTokens: [],
    },
  });

  const toggleToken = (tokenId: string) => {
    setSelectedTokens((current) =>
      current.includes(tokenId)
        ? current.filter((id) => id !== tokenId)
        : [...current, tokenId]
    );
  };

  const handleSliderChange = (value: number[]) => {
    const percent = value[0];
    setMinVotingPowerPercent(percent);
    form.setValue(
      "minVotingPower",
      Math.floor(totalVotingPower * (percent / 100)).toString()
    );
  };

  const handleCreateProposal = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        startTime: Math.floor(new Date(data.startTime).getTime() / 1000),
        endTime: Math.floor(new Date(data.endTime).getTime() / 1000),
        eligibleTokens: [TRO_TOKEN_ID, ...selectedTokens],
      };

      // Convert to UTC timestamps
      const startTimeUTC = Math.floor(Date.UTC(
        data.startTime.getFullYear(),
        data.startTime.getMonth(),
        data.startTime.getDate(),
        data.startTime.getHours(),
        data.startTime.getMinutes()
      ) / 1000);

      const endTimeUTC = Math.floor(Date.UTC(
        data.endTime.getFullYear(),
        data.endTime.getMonth(),
        data.endTime.getDate(),
        data.endTime.getHours(),
        data.endTime.getMinutes()
      ) / 1000);

      const formattedDataUTC = {
        ...formattedData,
        startTime: startTimeUTC,
        endTime: endTimeUTC,
      };

      console.log("formattedData", formattedDataUTC);

      await createProposal(
        formattedDataUTC.title,
        formattedDataUTC.description,
        formattedDataUTC.minVotingPower,
        formattedDataUTC.startTime,
        formattedDataUTC.endTime,
        formattedDataUTC.eligibleTokens.map((token: string) => ({
          token: token,
          // hardcoded for now, should be computed based on the TRO token supply of each pool
          numerator: 1,
          denominator: 1,
        }))
      );
      toast({
        title: "Success",
        description: "Proposal created successfully",
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proposal",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateProposal)}
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

            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date & Time</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-2">
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
                          className="w-full sm:w-[140px]"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(field.value);
                            newDate.setHours(
                              parseInt(hours),
                              parseInt(minutes)
                            );
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
                    <div className="flex flex-col sm:flex-row gap-2">
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
                              date < field.value ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormControl>
                        <Input
                          type="time"
                          className="w-full sm:w-[140px]"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(field.value);
                            newDate.setHours(
                              parseInt(hours),
                              parseInt(minutes)
                            );
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
                        <span>
                          {minVotingPowerPercent}% of total voting power
                        </span>
                        <span>
                          {Math.floor(
                            totalVotingPower * (minVotingPowerPercent / 100)
                          )}{" "}
                          tokens
                        </span>
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
                        <div
                          key={token.id}
                          className="flex items-center space-x-2"
                        >
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Proposal</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
