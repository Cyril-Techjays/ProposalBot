"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect, useCallback } from "react";
import { Loader2, Lightbulb } from "lucide-react";
import { proposalFormSchema, type ProposalFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { handleGenerateProposalAction, handleSuggestIndustryAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface ProposalFormProps {
  onProposalGenerated: (proposal: string, formData: ProposalFormData) => void;
  initialData?: Partial<ProposalFormData>;
  isLoadingExternally?: boolean;
}

export function ProposalForm({ onProposalGenerated, initialData, isLoadingExternally }: ProposalFormProps) {
  const [isGenerating, startGeneratingTransition] = useTransition();
  const [suggestedIndustries, setSuggestedIndustries] = useState<string[]>([]);
  const [isSuggestingIndustries, setIsSuggestingIndustries] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      companyClientName: "",
      projectName: "",
      industry: "",
      businessObjectives: "",
      currentPainPoints: "",
      proposedSolution: "",
      timeline: "",
      budget: "",
      teamSize: "",
      techStack: "",
      ...initialData, // Spread initialData to override defaults if provided
    },
  });
  
  // Effect to reset form when initialData changes (e.g. editing a different proposal)
  useEffect(() => {
    form.reset({
      companyClientName: "",
      projectName: "",
      industry: "",
      businessObjectives: "",
      currentPainPoints: "",
      proposedSolution: "",
      timeline: "",
      budget: "",
      teamSize: "",
      techStack: "",
      ...initialData,
    });
  }, [initialData, form]);


  const companyNameValue = form.watch("companyClientName");

  const fetchSuggestedIndustries = useCallback(async (name: string) => {
    if (!name || name.trim().length < 3) {
      setSuggestedIndustries([]);
      return;
    }
    setIsSuggestingIndustries(true);
    const result = await handleSuggestIndustryAction(name);
    if (result.industries) {
      setSuggestedIndustries(result.industries);
    } else if (result.error) {
      // Toast for error is optional, could be silent
      // toast({
      //   title: "Industry Suggestion Failed",
      //   description: result.error,
      //   variant: "destructive",
      // });
      setSuggestedIndustries([]);
    }
    setIsSuggestingIndustries(false);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (companyNameValue) {
        fetchSuggestedIndustries(companyNameValue);
      }
    }, 500); // Debounce API call
    return () => clearTimeout(debounceTimer);
  }, [companyNameValue, fetchSuggestedIndustries]);


  const onSubmit = (data: ProposalFormData) => {
    startGeneratingTransition(async () => {
      const result = await handleGenerateProposalAction(data);
      if (result.proposal) {
        onProposalGenerated(result.proposal, data);
        toast({
          title: "Proposal Generated!",
          description: "Your business proposal has been successfully created.",
        });
      } else if (result.error) {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };
  
  const isLoading = isGenerating || isLoadingExternally;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" />
          {initialData?.projectName ? `Editing: ${initialData.projectName}` : 'Create Your Proposal'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyClientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Innovatech Solutions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Project Phoenix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Industry</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal text-left h-auto min-h-10 py-2"
                        >
                          {field.value || "Select or type industry"}
                          {isSuggestingIndustries && <Loader2 className="ml-2 h-4 w-4 animate-spin flex-shrink-0" />}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search industry..."
                          value={field.value} 
                          onValueChange={(currentValue) => {
                            field.onChange(currentValue); 
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>No industry found.</CommandEmpty>
                          <CommandGroup>
                            {suggestedIndustries.map((industry) => (
                              <CommandItem
                                key={industry}
                                value={industry}
                                onSelect={() => {
                                  form.setValue("industry", industry, {shouldValidate: true});
                                }}
                              >
                                {industry}
                              </CommandItem>
                            ))}
                            {suggestedIndustries.length === 0 && field.value && !isSuggestingIndustries && (
                               <CommandItem
                                key={field.value}
                                value={field.value}
                                onSelect={() => {
                                  form.setValue("industry", field.value, {shouldValidate: true});
                                }}
                              >
                                Use "{field.value}"
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Type to search or select a suggested industry. Suggestions appear based on Company Name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessObjectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Objectives</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the key business goals for this project."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentPainPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Pain Points</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List current challenges or problems (e.g., using bullet points: * Low user engagement, - Inefficient processes)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="proposedSolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Solution</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Outline your proposed solution to address the pain points."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3-month project, Q1: Phase 1, Q2: Phase 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-medium pt-4 border-t border-border/50">Optional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $10,000 - $15,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5 members" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tech Stack</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Next.js, Firebase, Tailwind CSS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto text-base py-3 px-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                initialData?.projectName ? "Update & Regenerate Proposal" : "Generate Proposal"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
