
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
  label: z.string().describe("Label for the highlight (e.g., Timeline, Total Hours, Team Size)."),
  value: z.string().describe("Value for the highlight (e.g., 2-3 months, 150-200h, 2 members)."),
  colorName: z.string().describe("A color name hint for styling (e.g., 'green', 'purple', 'orange'). Will be mapped to Tailwind classes."),
});
export type HighlightItem = z.infer<typeof HighlightItemSchema>;

const SummaryBadgeSchema = z.object({
  icon: z.string().describe("Lucide icon name for the badge (e.g., 'Clock')."),
  text: z.string().describe("Text for the badge (e.g., '2-3 months', '1 team members', '$10,000 - $15,000').")
});
export type SummaryBadge = z.infer<typeof SummaryBadgeSchema>;

const RequirementsAnalysisSchema = z.object({
  projectRequirementsOverview: z.string().describe("A general overview of the project requirements (1-2 paragraphs)."),
  functionalRequirements: z.array(z.string()).min(3).max(7).describe("A list of 3-7 key functional requirements."),
  nonFunctionalRequirements: z.array(z.string()).min(3).max(7).describe("A list of 3-7 key non-functional requirements."),
});
export type RequirementsAnalysis = z.infer<typeof RequirementsAnalysisSchema>;

// Types for Feature Breakdown
const TagSchema = z.object({
  text: z.string().describe("Text for the tag (e.g., 'High Priority')."),
  colorScheme: z.string().describe("A color hint for styling the tag (e.g., 'red', 'blue', 'gray', 'green', 'yellow', 'indigo', 'purple', 'pink').")
});
export type Tag = z.infer<typeof TagSchema>;

const ResourceAllocationItemSchema = z.object({
  role: z.string().describe("The role allocated (e.g., 'Frontend Developer', 'Backend Developer', 'UI/UX Designer')."),
  hours: z.string().describe("Estimated hours for this role for this feature (e.g., '36h', '20h').")
});
export type ResourceAllocationItem = z.infer<typeof ResourceAllocationItemSchema>;

const FeatureItemSchema = z.object({
  id: z.string().describe("A unique ID for the feature, e.g., 'feat-auth'."),
  title: z.string().describe("The title of the feature (e.g., 'User Authentication & Authorization')."),
  description: z.string().describe("A brief description of the feature (e.g., 'User management, role-based access control, session management')."),
  totalHours: z.string().describe("Estimated total hours for this feature (e.g., '72 hours'). DO NOT include cost."),
  tags: z.array(TagSchema).min(1).max(2).optional().describe("1-2 descriptive tags for the feature."),
  functionalFeatures: z.array(z.string()).min(2).max(5).optional().describe("A list of 2-5 specific functional sub-features or points."),
  nonFunctionalRequirements: z.array(z.string()).min(1).max(4).optional().describe("A list of 1-4 related non-functional requirements."),
  resourceAllocation: z.array(ResourceAllocationItemSchema).min(1).max(3).optional().describe("A list of 1-3 resource allocations for this feature (role and hours). Sum of hours should be reasonable for totalHours. DO NOT include cost.")
});
export type FeatureItem = z.infer<typeof FeatureItemSchema>;

const FeatureBreakdownSchema = z.object({
  title: z.string().default("Detailed Feature Breakdown").describe("Main title for the feature breakdown section."),
  subtitle: z.string().default("Complete analysis of all features with time estimates. Cost information is omitted.").describe("Subtitle for the feature breakdown section."),
  features: z.array(FeatureItemSchema).min(2).max(4).describe("A list of 2-4 detailed features.")
});
export type FeatureBreakdown = z.infer<typeof FeatureBreakdownSchema>;

// Types for Project Timeline
const TimelinePhaseSchema = z.object({
  id: z.string().describe("A unique ID for the phase, e.g., 'phase-1'."),
  title: z.string().describe("The title of the project phase (e.g., 'Discovery & Requirements Analysis')."),
  description: z.string().describe("A brief description of what this phase entails."),
  duration: z.string().describe("Estimated duration of this phase (e.g., '2-3 weeks')."),
  percentageOfProject: z.string().optional().describe("Estimated percentage of total project effort/duration (e.g., '15% of project'). Not cost related."),
  keyDeliverables: z.array(z.string()).min(2).max(5).describe("A list of 2-5 key deliverables for this phase."),
});
export type TimelinePhase = z.infer<typeof TimelinePhaseSchema>;

const ProjectTimelineSectionSchema = z.object({
  title: z.string().default("Project Timeline & Phases").describe("Overall title for the project timeline section."),
  phases: z.array(TimelinePhaseSchema).min(3).max(5).describe("A list of 3-5 project phases."),
});
export type ProjectTimelineSectionData = z.infer<typeof ProjectTimelineSectionSchema>;


export const StructuredProposalSchema = z.object({
  proposalTitle: z.string().describe("Overall title for the proposal, e.g., 'Cyril - Comprehensive Proposal'."),
  clientName: z.string().describe("The name of the client company."),
  projectType: z.string().describe("The type of project (e.g., web application, mobile app)."),
  summaryBadges: z.array(SummaryBadgeSchema).length(3).describe("Array of 3 summary badges (timeline, team members, budget)."),

  executiveSummary: z.object({
    summaryText: z.string().describe("The main text for the executive summary, around 50-100 words."),
    highlights: z.array(HighlightItemSchema).length(3).describe("Array of 3 key highlight cards: Timeline, Total Hours, Team Size."),
    projectGoals: z.array(ProjectGoalSchema).min(2).max(5).describe("A list of 2-5 key project goals and objectives."),
  }),
  requirementsAnalysis: RequirementsAnalysisSchema,
  featureBreakdown: FeatureBreakdownSchema,
  projectTimelineSection: ProjectTimelineSectionSchema,
  teamAndResources: z.object({
    content: z.string().describe("Detailed content for Team & Resources section (at least 2-3 paragraphs).")
  }),
});
export type StructuredProposal = z.infer<typeof StructuredProposalSchema>;

