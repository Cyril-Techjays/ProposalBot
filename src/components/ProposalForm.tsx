"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Loader2, FileText } from "lucide-react";
import { multiStepProposalFormSchema, type MultiStepProposalFormData } from "@/lib/types";
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
  onNext: (formData: MultiStepProposalFormData) => void;
  initialData?: Partial<MultiStepProposalFormData>;
  isGenerating?: boolean;
}

export function ProposalForm({ onNext, initialData, isGenerating }: ProposalFormProps) {
  const { toast } = useToast();

  const form = useForm<MultiStepProposalFormData>({
    resolver: zodResolver(multiStepProposalFormSchema),
    defaultValues: {
      companyClientName: "",
      projectName: "",
      basicRequirements: "",
      teamCompositionData: [],
      ...initialData,
    },
  });
  
  useEffect(() => {
    if (initialData) {
      form.reset({
        companyClientName: initialData.companyClientName || "",
        projectName: initialData.projectName || "",
        basicRequirements: initialData.basicRequirements || "",
        teamCompositionData: initialData.teamCompositionData || [],
      });
    }
  }, [initialData, form]);

  const onSubmit = (data: MultiStepProposalFormData) => {
    onNext(data);
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

            <Button type="submit" disabled={isGenerating} className="w-full text-lg py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              Next: Team Composition
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

