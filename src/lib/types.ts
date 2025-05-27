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
  }).default({}),
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;

// For saving simple text proposals (current page.tsx functionality)
export interface SavedProposal extends ProposalFormData {
  id: string;
  generatedProposalText: string;
  createdAt: string;
  industry?: string;
  businessObjectives?: string;
  currentPainPoints?: string;
  proposedSolution?: string;
  timeline?: string;
  budget?: string;
  teamSize?: string;
  techStack?: string;
}

// New types for structured proposal display
const ProjectGoalSchema = z.object({
  id: z.string().describe("A unique ID for the goal, e.g., 'goal-1'"),
  title: z.string().describe("The title of the project goal."),
  description: z.string().describe("A brief description of the project goal.")
});
export type ProjectGoal = z.infer<typeof ProjectGoalSchema>;

const HighlightItemSchema = z.object({
  label: z.string().describe("Label for the highlight (e.g., Project Investment, Timeline)."),
  value: z.string().describe("Value for the highlight (e.g., $10,625, 2-3 months)."),
  colorName: z.string().describe("A color name hint for styling (e.g., 'blue', 'green', 'purple', 'orange'). Will be mapped to Tailwind classes."),
});
export type HighlightItem = z.infer<typeof HighlightItemSchema>;

const SummaryBadgeSchema = z.object({
  icon: z.string().describe("Lucide icon name for the badge (e.g., 'Clock')."),
  text: z.string().describe("Text for the badge (e.g., '2-3 months', '1 team members', '$10,625').")
});
export type SummaryBadge = z.infer<typeof SummaryBadgeSchema>;

const RequirementsAnalysisSchema = z.object({
  projectRequirementsOverview: z.string().describe("A general overview of the project requirements (1-2 paragraphs)."),
  functionalRequirements: z.array(z.string()).min(3).max(7).describe("A list of 3-7 key functional requirements."),
  nonFunctionalRequirements: z.array(z.string()).min(3).max(7).describe("A list of 3-7 key non-functional requirements."),
});
export type RequirementsAnalysis = z.infer<typeof RequirementsAnalysisSchema>;

export const StructuredProposalSchema = z.object({
  proposalTitle: z.string().describe("Overall title for the proposal, e.g., 'Cyril - Comprehensive Proposal'."),
  clientName: z.string().describe("The name of the client company."),
  projectType: z.string().describe("The type of project (e.g., web application, mobile app)."),
  summaryBadges: z.array(SummaryBadgeSchema).describe("Array of 3 summary badges (timeline, team members, budget)."),

  executiveSummary: z.object({
    summaryText: z.string().describe("The main text for the executive summary, around 50-100 words."),
    highlights: z.array(HighlightItemSchema).length(4).describe("Array of 4 key highlight cards: Project Investment, Timeline, Total Hours, Team Size."),
    projectGoals: z.array(ProjectGoalSchema).min(2).max(5).describe("A list of 2-5 key project goals and objectives."),
  }),
  requirementsAnalysis: RequirementsAnalysisSchema,
  featureBreakdown: z.object({
    content: z.string().describe("Detailed content for Feature Breakdown section (at least 2-3 paragraphs).")
  }),
  projectTimelineSection: z.object({
    content: z.string().describe("Detailed content for Project Timeline section (at least 2-3 paragraphs).")
  }),
  budgetAndInvestmentSection: z.object({
    content: z.string().describe("Detailed content for Budget & Investment section (at least 2-3 paragraphs).")
  }),
  teamAndResources: z.object({
    content: z.string().describe("Detailed content for Team & Resources section (at least 2-3 paragraphs).")
  }),
});
export type StructuredProposal = z.infer<typeof StructuredProposalSchema>;
