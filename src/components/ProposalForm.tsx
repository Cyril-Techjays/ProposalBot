"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
// handleGenerateProposalAction is now called from page.tsx
// import { handleGenerateProposalAction } from "@/app/actions"; 
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface ProposalFormProps {
  onGenerate: (formData: ProposalFormData) => void; // Changed from onProposalGenerated
  initialData?: Partial<ProposalFormData>;
  isGenerating?: boolean; // Changed from isLoadingExternally
}

const teamCompositionRoles = [
  { id: "frontendDeveloper", label: "Frontend Developer" },
  { id: "backendDeveloper", label: "Backend Developer" },
  { id: "uiUxDesigner", label: "UI/UX Designer" },
  { id: "qaEngineer", label: "QA Engineer" },
  { id: "businessAnalyst", label: "Business Analyst" },
  { id: "projectManager", label: "Project Manager" },
] as const;


export function ProposalForm({ onGenerate, initialData, isGenerating }: ProposalFormProps) {
  // const [isGenerating, startGeneratingTransition] = useTransition(); // Transition managed by parent page
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
    if (initialData) {
      form.reset({
        companyClientName: initialData.companyClientName || "",
        projectName: initialData.projectName || "",
        basicRequirements: initialData.basicRequirements || "",
        teamComposition: initialData.teamComposition || {
          frontendDeveloper: false,
          backendDeveloper: false,
          uiUxDesigner: false,
          qaEngineer: false,
          businessAnalyst: false,
          projectManager: false,
        },
      });
    }
  }, [initialData, form]);

  const onSubmit = (data: ProposalFormData) => {
    onGenerate(data); // Parent page will handle the action and transition
  };
  
  // const isLoading = isGenerating || isLoadingExternally; // Simplified

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
              <FormLabel>Team Composition</FormLabel>
              <FormDescription className="mb-2">Select the roles required for the project (optional).</FormDescription>
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
                 {form.formState.errors.teamComposition?.root?.message}
              </FormMessage>
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full text-lg py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isGenerating ? (
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
