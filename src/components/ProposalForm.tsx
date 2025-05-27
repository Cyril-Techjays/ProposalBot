"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { Loader2, FileText } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { handleGenerateProposalAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface ProposalFormProps {
  onProposalGenerated: (proposal: string, formData: ProposalFormData) => void;
  initialData?: Partial<ProposalFormData>; // Kept for potential future use, but current UI doesn't trigger editing
  isLoadingExternally?: boolean;
}

const teamCompositionRoles = [
  { id: "frontendDeveloper", label: "Frontend Developer" },
  { id: "backendDeveloper", label: "Backend Developer" },
  { id: "uiUxDesigner", label: "UI/UX Designer" },
  { id: "qaEngineer", label: "QA Engineer" },
  { id: "businessAnalyst", label: "Business Analyst" },
  { id: "projectManager", label: "Project Manager" },
] as const;


export function ProposalForm({ onProposalGenerated, initialData, isLoadingExternally }: ProposalFormProps) {
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      companyClientName: "",
      projectName: "",
      basicRequirements: "",
      teamComposition: {
        frontendDeveloper: false,
        backendDeveloper: false,
        uiUxDesigner: false,
        qaEngineer: false,
        businessAnalyst: false,
        projectManager: false,
      },
      ...initialData, 
    },
  });
  
  useEffect(() => {
    form.reset({
      companyClientName: initialData?.companyClientName || "",
      projectName: initialData?.projectName || "",
      basicRequirements: initialData?.basicRequirements || "",
      teamComposition: initialData?.teamComposition || {
        frontendDeveloper: false,
        backendDeveloper: false,
        uiUxDesigner: false,
        qaEngineer: false,
        businessAnalyst: false,
        projectManager: false,
      },
    });
  }, [initialData, form]);

  const onSubmit = (data: ProposalFormData) => {
    startGeneratingTransition(async () => {
      const result = await handleGenerateProposalAction(data);
      if (result.proposal) {
        onProposalGenerated(result.proposal, data);
        toast({
          title: "Proposal Generated!",
          description: "Your detailed business proposal has been successfully created.",
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
    <Card className="shadow-xl border-none w-full max-w-2xl mx-auto">
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyClientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client company name" {...field} />
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
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basicRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Requirements *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the project requirements, features needed, target audience, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Team Composition *</FormLabel>
              <FormDescription className="mb-2">Select the roles required for the project.</FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {teamCompositionRoles.map((role) => (
                  <FormField
                    key={role.id}
                    control={form.control}
                    name={`teamComposition.${role.id}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-background hover:bg-muted/50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id={`team-${role.id}`}
                          />
                        </FormControl>
                        <FormLabel htmlFor={`team-${role.id}`} className="font-normal text-sm leading-none cursor-pointer flex-grow">
                          {role.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
               <FormMessage>
                {/* This is a bit tricky with nested objects, react-hook-form might not show top-level error for object directly */}
                {/* For now, individual checkbox errors are not typical, more about the group if needed */}
              </FormMessage>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 h-auto bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Detailed Proposal
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
