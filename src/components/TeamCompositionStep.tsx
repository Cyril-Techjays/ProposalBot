"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

import { TeamCompositionDataSchema, type TeamMember, teamMemberRoles, seniorityLevels, MultiStepProposalFormData, multiStepProposalFormSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface TeamCompositionStepProps {
  initialData: MultiStepProposalFormData; // Data from the previous step
  onGenerate: (formData: MultiStepProposalFormData) => void; // Function to trigger generation
  onPrevious: (formData: MultiStepProposalFormData) => void; // Function to go back
  isGenerating?: boolean;
}

// Define a schema for adding a single team member
const AddTeamMemberSchema = z.object({
  role: z.enum(teamMemberRoles, { required_error: "Please select a role." }),
  seniority: z.enum(seniorityLevels, { required_error: "Please select seniority." }),
});

type AddTeamMemberFormValues = z.infer<typeof AddTeamMemberSchema>;

export function TeamCompositionStep({ initialData, onGenerate, onPrevious, isGenerating }: TeamCompositionStepProps) {
  const { toast } = useToast();

  // State to force re-render of dropdowns after reset
  const [resetKey, setResetKey] = useState(0);

  // Form for the overall team composition list
  const form = useForm<MultiStepProposalFormData>({
    resolver: zodResolver(multiStepProposalFormSchema), // Use the full multi-step schema
    defaultValues: {
      ...initialData, // Set all initial data from previous step
      teamCompositionData: initialData.teamCompositionData || [], // Ensure teamCompositionData is initialized if initialData is partial
    },
  });

  // Use useFieldArray to manage the list of team members
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teamCompositionData",
  });

  // Form for adding a new team member (separate form for easier validation of the add operation)
  const addMemberForm = useForm<AddTeamMemberFormValues>({
    resolver: zodResolver(AddTeamMemberSchema),
    defaultValues: {
      role: undefined, // Default to no role selected
      seniority: undefined, // Default to no seniority selected
    }
  });

  const handleAddTeamMember = (values: AddTeamMemberFormValues) => {
    append({ ...values, id: uuidv4() }); // Add with a unique ID
    // Reset the form and its state
    addMemberForm.reset({ role: undefined, seniority: undefined });
    // Increment resetKey to force re-render of dropdowns
    setResetKey(prevKey => prevKey + 1);
  };

  const handleGenerateClick = () => {
    // Get current team composition data from the form state
    const currentTeamCompositionData = form.getValues("teamCompositionData");
    // Combine with initial data from the first step
    const finalFormData: MultiStepProposalFormData = {
        ...initialData, // Includes clientName, projectName, basicRequirements
        teamCompositionData: currentTeamCompositionData,
    };
    onGenerate(finalFormData);
  };

  return (
    <Card className="shadow-xl border-none w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Team Composition</CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Form for adding a new team member */}
        <Card className="bg-muted/40 border-dashed border-2 p-4">
            <CardTitle className="text-lg mb-4">Add Team Member</CardTitle>
            <Form {...addMemberForm}>
              <form onSubmit={addMemberForm.handleSubmit(handleAddTeamMember)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <FormField
                  key={`role-${resetKey}`}
                  control={addMemberForm.control}
                  name="role"
                  render={({ field }) => {
                    console.log('Role field.value:', field.value);
                    return (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMemberRoles.map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                 <FormField
                  key={`seniority-${resetKey}`}
                  control={addMemberForm.control}
                  name="seniority"
                  render={({ field }) => {
                     console.log('Seniority field.value:', field.value);
                    return (
                      <FormItem>
                      <FormLabel>Seniority</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select seniority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seniorityLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                   );
                  }}
                />
                <Button type="submit" className="col-span-1 sm:col-span-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
              </form>
            </Form>
        </Card>

        {/* Display list of added team members */}
        {fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Added Team Members:</h3>
            <ul className="space-y-3">
              {fields.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                  <span>{item.seniority} {item.role}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(index)} 
                    aria-label={`Remove ${item.seniority} ${item.role}`}
                  >
                    <MinusCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between gap-4 mt-6">
           <Button type="button" variant="outline" onClick={() => onPrevious(form.getValues())} disabled={isGenerating}>
              Previous
           </Button>
          <Button type="button" onClick={handleGenerateClick} disabled={isGenerating || fields.length === 0} className="flex-grow">
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
        </div>
      </CardContent>
    </Card>
  );
} 