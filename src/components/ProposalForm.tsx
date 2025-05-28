
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
// Checkbox is no longer directly used here for these roles, but kept for potential future use / other checkboxes
// import { Checkbox } from "@/components/ui/checkbox"; 
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface ProposalFormProps {
  onGenerate: (formData: ProposalFormData) => void;
  initialData?: Partial<ProposalFormData>;
  isGenerating?: boolean;
}

const teamCompositionRoles = [
  { id: "frontendDeveloper", label: "Frontend Developers", type: "number", max: 10 },
  { id: "backendDeveloper", label: "Backend Developers", type: "number", max: 10 },
  { id: "businessAnalyst", label: "Business Analysts", type: "number", max: 5 },
  { id: "uiUxDesigner", label: "UI/UX Designers", type: "number", max: 5 }, // Changed
  { id: "qaEngineer", label: "QA Engineers", type: "number", max: 5 }, // Changed
  { id: "projectManager", label: "Project Managers", type: "number", max: 5 }, // Changed
] as const;


export function ProposalForm({ onGenerate, initialData, isGenerating }: ProposalFormProps) {
  const { toast } = useToast();

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      companyClientName: "",
      projectName: "",
      basicRequirements: "",
      teamComposition: {
        frontendDeveloper: 0,
        backendDeveloper: 0,
        uiUxDesigner: 0, // Changed
        qaEngineer: 0, // Changed
        businessAnalyst: 0,
        projectManager: 0, // Changed
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
        teamComposition: {
          frontendDeveloper: initialData.teamComposition?.frontendDeveloper || 0,
          backendDeveloper: initialData.teamComposition?.backendDeveloper || 0,
          uiUxDesigner: initialData.teamComposition?.uiUxDesigner || 0, // Changed
          qaEngineer: initialData.teamComposition?.qaEngineer || 0, // Changed
          businessAnalyst: initialData.teamComposition?.businessAnalyst || 0,
          projectManager: initialData.teamComposition?.projectManager || 0, // Changed
        },
      });
    }
  }, [initialData, form]);

  const onSubmit = (data: ProposalFormData) => {
    onGenerate(data);
  };
  
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
              <FormDescription className="mb-2">Specify quantities for each role required for the project (optional).</FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-1">
                {teamCompositionRoles.map((role) => {
                  // All roles are now 'number' type based on the request
                  return (
                    <FormField
                      key={role.id}
                      control={form.control}
                      name={`teamComposition.${role.id}`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>{role.label}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max={role.max}
                              placeholder="0"
                              {...field}
                              value={field.value || 0} // Ensure value is a number
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
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

