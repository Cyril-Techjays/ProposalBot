import { z } from 'zod';

export const proposalFormSchema = z.object({
  companyClientName: z.string().min(1, 'Company/Client Name is required.'),
  projectName: z.string().min(1, 'Project Name is required.'),
  industry: z.string().min(1, 'Industry is required.'),
  businessObjectives: z.string().min(10, 'Business Objectives must be at least 10 characters.'),
  currentPainPoints: z.string().min(10, 'Current Pain Points must be at least 10 characters (e.g. bullet points).'),
  proposedSolution: z.string().min(10, 'Proposed Solution must be at least 10 characters.'),
  timeline: z.string().min(5, 'Timeline description is required.'),
  budget: z.string().optional(),
  teamSize: z.string().optional(),
  techStack: z.string().optional(),
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;

export interface SavedProposal extends ProposalFormData {
  id: string;
  generatedProposalText: string;
  createdAt: string; 
}
