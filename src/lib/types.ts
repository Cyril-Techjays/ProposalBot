
import { z } from 'zod';

export const proposalFormSchema = z.object({
  companyClientName: z.string().min(1, 'Client Company Name is required.'),
  projectName: z.string().min(1, 'Project Name is required.'),
  basicRequirements: z.string().min(10, 'Basic Requirements must be at least 10 characters.'),
  teamComposition: z.object({
    frontendDeveloper: z.number().int().min(0).max(10).optional().default(0),
    backendDeveloper: z.number().int().min(0).max(10).optional().default(0),
    uiUxDesigner: z.number().int().min(0).max(5).optional().default(0),
    qaEngineer: z.number().int().min(0).max(5).optional().default(0),
    businessAnalyst: z.number().int().min(0).max(5).optional().default(0),
    projectManager: z.number().int().min(0).max(5).optional().default(0),
  }).default({
    frontendDeveloper: 0,
    backendDeveloper: 0,
    uiUxDesigner: 0,
    qaEngineer: 0,
    businessAnalyst: 0,
    projectManager: 0,
  }),
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;

// Removed SavedProposal interface as the simple save functionality is being removed.

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
  icon: z.string().describe("Lucide icon name for the badge (e.g., 'Clock', 'Users2')."),
  text: z.string().describe("Text for the badge (e.g., '2-3 months', '1 team members'). No monetary values.")
});
export type SummaryBadge = z.infer<typeof SummaryBadgeSchema>;

const RequirementsAnalysisSchema = z.object({
  projectRequirementsOverview: z.string().describe("A general overview of the project requirements (1-2 paragraphs)."),
  functionalRequirements: z.array(z.string()).optional().describe("A list of key functional requirements."),
  nonFunctionalRequirements: z.array(z.string()).optional().describe("A list of key non-functional requirements."),
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
  hours: z.string().describe("Estimated hours for this role for this feature (e.g., '36h', '20h'). No cost information.")
});
export type ResourceAllocationItem = z.infer<typeof ResourceAllocationItemSchema>;

const FeatureItemSchema = z.object({
  id: z.string().describe("A unique ID for the feature, e.g., 'feat-auth'."),
  title: z.string().describe("The title of the feature (e.g., 'User Authentication & Authorization')."),
  description: z.string().describe("A brief description of the feature (e.g., 'User management, role-based access control, session management')."),
  totalHours: z.string().describe("Estimated total hours for this feature (e.g., '72 hours'). DO NOT include cost."),
  tags: z.array(TagSchema).optional().describe("Descriptive tags for the feature."),
  functionalFeatures: z.array(z.string()).optional().describe("A list of specific functional sub-features or points."),
  nonFunctionalRequirements: z.array(z.string()).optional().describe("A list of related non-functional requirements."),
  resourceAllocation: z.array(ResourceAllocationItemSchema).optional().describe("A list of resource allocations for this feature (role and hours). Sum of hours should be reasonable for totalHours. DO NOT include cost.")
});
export type FeatureItem = z.infer<typeof FeatureItemSchema>;

const FeatureBreakdownSchema = z.object({
  title: z.string().default("Detailed Feature Breakdown").describe("Main title for the feature breakdown section."),
  subtitle: z.string().default("Complete analysis of all features with time estimates. Cost information is omitted.").describe("Subtitle for the feature breakdown section."),
  features: z.array(FeatureItemSchema).optional().describe("A list of detailed features.")
});
export type FeatureBreakdown = z.infer<typeof FeatureBreakdownSchema>;

// Types for Project Timeline
const TimelinePhaseSchema = z.object({
  id: z.string().describe("A unique ID for the phase, e.g., 'phase-1'."),
  title: z.string().describe("The title of the project phase (e.g., 'Discovery & Requirements Analysis')."),
  description: z.string().describe("A brief description of what this phase entails."),
  duration: z.string().describe("Estimated duration of this phase (e.g., '2-3 weeks')."),
  percentageOfProject: z.string().optional().describe("Estimated percentage of total project effort/duration (e.g., '15% of project'). Not cost related."),
  keyDeliverables: z.array(z.string()).optional().describe("A list of key deliverables for this phase."),
});
export type TimelinePhase = z.infer<typeof TimelinePhaseSchema>;

const ProjectTimelineSectionSchema = z.object({
  title: z.string().default("Project Timeline & Phases").describe("Overall title for the project timeline section."),
  phases: z.array(TimelinePhaseSchema).optional().describe("A list of project phases."),
});
export type ProjectTimelineSectionData = z.infer<typeof ProjectTimelineSectionSchema>;

// Types for Team & Resources
const RoleAllocationSchema = z.object({
  roleName: z.string().describe("Name of the team role (e.g., Frontend Developer)."),
  totalHours: z.string().describe("Estimated total hours for this role for the project (e.g., '170h')."),
  duration: z.string().describe("Estimated duration this role will be involved (e.g., '5 weeks')."),
  utilization: z.string().describe("Estimated utilization percentage for this role (e.g., '85%').")
  // Hourly Rate and Total Cost are intentionally omitted
});
export type RoleAllocation = z.infer<typeof RoleAllocationSchema>;

const RoleResponsibilitiesSchema = z.object({
  roleName: z.string().describe("Name of the team role (e.g., Frontend Developer)."),
  responsibilities: z.array(z.string()).optional().describe("List of key responsibilities for this role.") 
});
export type RoleResponsibilities = z.infer<typeof RoleResponsibilitiesSchema>;

const TeamAndResourcesSchema = z.object({
  teamAllocationTitle: z.string().default("Team Allocation & Resource Planning").describe("Title for the team allocation subsection."),
  teamAllocations: z.array(RoleAllocationSchema).optional().describe("List of resource allocations per role. IMPORTANT: Do NOT include 'Hourly Rate' or 'Total Cost' in the output for any role."),
  teamStructureTitle: z.string().default("Team Structure & Responsibilities").describe("Title for the team structure subsection."),
  teamStructure: z.array(RoleResponsibilitiesSchema).optional().describe("List of responsibilities per role.")
});
export type TeamAndResources = z.infer<typeof TeamAndResourcesSchema>;


export const StructuredProposalSchema = z.object({
  proposalTitle: z.string().describe("Overall title for the proposal, e.g., 'Cyril - Comprehensive Proposal'."),
  clientName: z.string().describe("The name of the client company."),
  projectType: z.string().describe("The type of project (e.g., web application, mobile app)."),
  summaryBadges: z.array(SummaryBadgeSchema).optional().describe("Array of summary badges (timeline, team members). Should be 2 badges based on prompt. No monetary values."),

  executiveSummary: z.object({
    summaryText: z.string().describe("The main text for the executive summary, around 50-100 words."),
    highlights: z.array(HighlightItemSchema).optional().describe("Array of key highlight cards: Timeline, Total Hours, Team Size. Should be 3 highlights based on prompt."),
    projectGoals: z.array(ProjectGoalSchema).optional().describe("A list of key project goals and objectives."), 
  }),
  requirementsAnalysis: RequirementsAnalysisSchema.optional(),
  featureBreakdown: FeatureBreakdownSchema.optional(), 
  projectTimelineSection: ProjectTimelineSectionSchema.optional(),
  teamAndResources: TeamAndResourcesSchema.optional(),
});
export type StructuredProposal = z.infer<typeof StructuredProposalSchema>;

// For use in AIChatModal to identify which section's content to provide
export type ProposalSectionKey = 
  | 'executiveSummary' 
  | 'requirementsAnalysis' 
  | 'featureBreakdown' 
  | 'projectTimelineSection' 
  | 'teamAndResources';

