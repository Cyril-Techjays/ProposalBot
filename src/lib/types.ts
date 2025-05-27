import { z } from 'zod';

export const proposalFormSchema = z.object({
  companyClientName: z.string().min(1, 'Client Company Name is required.'),
  projectName: z.string().min(1, 'Project Name is required.'),
  basicRequirements: z.string().min(10, 'Basic Requirements must be at least 10 characters.'),
  teamComposition: z.object({
    frontendDeveloper: z.boolean().default(false).optional(),
    backendDeveloper: z.boolean().default(false).optional(),
    uiUxDesigner: z.boolean().default(false).optional(),
    qaEngineer: z.boolean().default(false).optional(),
    businessAnalyst: z.boolean().default(false).optional(),
    projectManager: z.boolean().default(false).optional(),
  }).default({}), // Ensure teamComposition is always an object
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;

// Keep SavedProposal compatible with the core fields for display and potential future use
// Fields removed from ProposalFormData are now optional here or handled if undefined.
export interface SavedProposal extends ProposalFormData {
  id: string;
  generatedProposalText: string;
  createdAt: string;
  // Fields that were in old ProposalFormData but not in new
  industry?: string;
  businessObjectives?: string;
  currentPainPoints?: string;
  proposedSolution?: string;
  timeline?: string;
  budget?: string;
  teamSize?: string;
  techStack?: string;
}
