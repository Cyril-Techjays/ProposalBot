// src/ai/flows/generate-proposal.ts
'use server';

/**
 * @fileOverview Generates a structured business proposal based on user inputs.
 *
 * - generateProposal - A function that generates a structured business proposal.
 * - GenerateProposalInput - The input type for the generateProposal function (remains the same).
 * - StructuredProposal - The output type for the generateProposal function (new structured format).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ProposalFormData } from '@/lib/types'; // For input mapping
import { StructuredProposalSchema, type StructuredProposal, type TeamMember } from '@/lib/types';
import { processProposalGeneration, type SeniorityLevel } from '../aiRules';

// Input schema remains the same as what ProposalForm provides
const GenerateProposalInputSchema = z.object({
  companyClientName: z.string().describe('The name of the company or client.'),
  projectName: z.string().describe('The name of the project.'),
  basicRequirements: z.string().describe('The basic requirements of the project, including features, target audience, etc.'),
  teamComposition: z.string().optional().describe('A comma-separated list of team roles required for the project (e.g., Frontend Developer, UI/UX Designer).'),
  processedFeatures: z.string().optional().describe('The processed features from the AI rules.'),
  estimatedTimeline: z.string().optional().describe('The estimated timeline from the AI rules.'),
});

export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

// Output type is now the new StructuredProposal
export type GenerateProposalOutput = StructuredProposal;

export async function generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
  return generateProposalFlow(input);
}

const generateProposalPrompt = ai.definePrompt({
  name: 'generateStructuredProposalPrompt',
  input: {schema: GenerateProposalInputSchema},
  output: {schema: StructuredProposalSchema},
  prompt: `You are an expert business proposal writer. Based on the information provided, generate a comprehensive and persuasive business proposal in a structured format.
**IMPORTANT RULE: Under no circumstances should any monetary values, costs, prices, or budgets be included in any part of the proposal. All estimates should be in terms of time (hours, weeks, months) or resource allocation (number of people, roles).**

Client Company Name: {{{companyClientName}}}
Project Name: {{{projectName}}}
Basic Requirements: {{{basicRequirements}}}

Team Composition (JSON String): {{{teamComposition}}}

Processed Features (JSON String): {{{processedFeatures}}}
Estimated Timeline: {{{estimatedTimeline}}}

**Instructions for Team Composition:**
- The 'Team Composition' input is a JSON string representing an array of team member objects. Each object has two fields: 'role' (string, e.g., "Frontend Developer") and 'seniority' (string, one of "Entry Level", "Mid Level", "Senior Level").
- **Crucially, parse this JSON string internally** to understand the exact list of team members and their seniority.
- Use this parsed list to accurately determine the total number of team members for summary badges and highlights.

**Instructions for Processed Features:**
- The 'Processed Features' input is a JSON string containing the validated features and tasks breakdown.
- Use these features to populate the featureBreakdown section of the proposal.
- Ensure all features and tasks are properly validated and required.
- Use the estimated hours from the tasks to calculate timelines and resource allocation.

**Instructions for Team & Resources Section:**
- When generating the 'teamAndResources' section in the output JSON, you must create an entry in the 'teamMembers' array for *each individual team member* present in the parsed 'Team Composition' input list.
- For each individual team member object from the input list, create a corresponding object in the output 'teamMembers' array following the IndividualTeamMemberAllocationSchema.
- Populate the 'roleName' and 'seniority' fields in the output object directly from the input team member object.
- Generate realistic estimates for 'totalHours', 'duration', and 'utilization' specifically for *this individual team member*, taking into account their stated 'role' and 'seniority', as well as the overall 'Project Name' and 'Basic Requirements'. Seniority should significantly influence these estimates (e.g., a Senior Developer will have higher hourly estimates than an Entry Level Developer for similar tasks).
- Generate a list of 'responsibilities' specifically for *this individual team member*, tailored to their 'role' and 'seniority'.
- Ensure the 'teamMembers' array in your output accurately reflects the exact list of individuals from the input, with their corresponding generated allocations and responsibilities.

Please provide the output in the following JSON structure. Ensure all fields are populated accurately and professionally, adhering strictly to the no-monetary-values rule.

**Output Structure Guidance:**

1.  **proposalTitle**: Combine Project Name and "Comprehensive Proposal". Example: "{{{projectName}}} - Comprehensive Proposal".
2.  **clientName**: Use "{{{companyClientName}}}".
3.  **projectType**: Infer from basic requirements (e.g., "Web Application", "Mobile App Development", "AI Integration Project").
4.  **summaryBadges**: Create exactly **2** badges:
    *   One for an estimated timeline (use the provided estimatedTimeline), icon: "Clock".
    *   One for team members (e.g., "5 team members", icon: "Users2"). **Calculate the total number of team members directly from the provided 'Team Composition' JSON array.**
    *   **DO NOT create a budget badge or any badge with monetary values.**
5.  **executiveSummary**:
    *   **summaryText**: A concise overview (50-100 words) of the project, its purpose, and key outcomes. **Do not mention budget or cost.**
    *   **highlights**: Exactly 3 highlight items:
        *   Item 1: Label "Timeline", Value (use the provided estimatedTimeline), colorName: "green".
        *   Item 2: Label "Total Hours", Value (calculated from processedFeatures), colorName: "blue".
        *   Item 3: Label "Team Size", Value (number of team members), colorName: "purple".
    *   **projectGoals**: 2 to 5 project goals. Each goal needs an id, title, and description.
6.  **requirementsAnalysis**:
    *   **projectRequirementsOverview**: A concise overview of the project requirements based on the provided 'Basic Requirements'. This should be 1-2 paragraphs.
    *   **functionalRequirements**: A list of 3 to 7 key functional requirements derived from the 'Basic Requirements'.
    *   **nonFunctionalRequirements**: A list of 3 to 7 key non-functional requirements.
7.  **featureBreakdown**:
    *   **title**: "Detailed Feature Breakdown"
    *   **subtitle**: "Complete analysis of all features with time estimates. Cost information is omitted."
    *   **features**: Use the features from processedFeatures. For each feature item:
        *   **id**: A unique string ID (e.g., "feat-auth", "feat-dashboard").
        *   **title**: A descriptive title for the feature.
        *   **description**: A short summary of the feature.
        *   **totalHours**: Use the estimated hours from the processed features.
        *   **tags**: (Optional) 1-2 tags. Each tag needs \`text\` and \`colorScheme\`.
        *   **functionalFeatures**: (Optional) A list of 2-5 specific functional sub-features or points.
        *   **nonFunctionalRequirements**: (Optional) A list of 1-4 non-functional requirements specific to this feature.
        *   **resourceAllocation**: (Optional) For *each* unique role present in the 'Team Composition' JSON input, list an estimated time allocation for *this specific feature*.
8.  **projectTimelineSection**:
    *   **title**: "Project Timeline & Phases"
    *   **phases**: Generate 3 to 5 project phases based on the processed features and timeline.
        *   **id**: A unique string ID (e.g., "phase-discovery", "phase-design").
        *   **title**: A descriptive title for the phase.
        *   **description**: A short summary of the activities in this phase.
        *   **duration**: An estimated duration for this phase based on the processed features.
        *   **percentageOfProject**: (Optional) An estimated percentage of the total project effort or duration this phase represents.
        *   **keyDeliverables**: A list of 2-5 key deliverables for this phase.
9.  **teamAndResources**:
    *   **sectionTitle**: "Project Team & Resources"
    *   **teamMembers**: An array of team member objects based on the Team Composition input.
        *   Each object must have:
            *   **id**: A unique string ID.
            *   **roleName**: The role from the Team Composition input.
            *   **seniority**: The seniority level from the Team Composition input.
            *   **totalHours**: Estimated hours based on the processed features and seniority level.
            *   **duration**: Estimated duration based on the processed features and seniority level.
            *   **utilization**: Estimated utilization percentage.
            *   **responsibilities**: A list of 2-5 key responsibilities.

Ensure all text content is well-written, professional, and tailored to the input.
For numerical values like hours, use the estimates from the processed features.
The projectType should be a concise phrase.
The team members count for the summary badge and highlights should be the exact count of items in the parsed 'Team Composition' JSON array.
Total hours highlight should be calculated from the processed features.
The functional and non-functional requirements should be clear, distinct points.
`,
});

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: StructuredProposalSchema,
  },
  async (input: GenerateProposalInput) : Promise<StructuredProposal> => {
    // Parse team composition to get seniority levels
    let teamCompositionData: TeamMember[] = [];
    if (input.teamComposition) {
      try {
        const parsed = JSON.parse(input.teamComposition);
        if (Array.isArray(parsed)) {
          teamCompositionData = parsed.filter(item => 
            item && typeof item === 'object' 
            && typeof item.role === 'string' 
            && typeof item.seniority === 'string'
          ) as TeamMember[];
        }
      } catch (e) {
        console.error("Error parsing teamComposition JSON string:", e);
      }
    }

    // Process the proposal using our AI rules
    const { features, timeline } = await processProposalGeneration(
      input.basicRequirements,
      teamCompositionData[0]?.seniority.toLowerCase() as SeniorityLevel || 'mid'
    );

    // Generate the proposal using the AI
    const {output} = await generateProposalPrompt({
      ...input,
      // Add the processed features and timeline to the prompt
      processedFeatures: JSON.stringify(features),
      estimatedTimeline: timeline.toString(),
    });

    if (!output) {
      throw new Error("AI failed to generate a structured proposal.");
    }

    // Add logging for the raw AI output
    console.log("Raw AI Output:", JSON.stringify(output, null, 2));

    // Basic validation checks based on prompt guidance
    if (output.summaryBadges?.length && output.summaryBadges?.length !== 2) {
      console.warn("AI generated a number of summary badges different from prompt guidance. Expected 2, got:", output.summaryBadges?.length);
    }

    // Check for dollar signs or known currency symbols in summary badge text
    output.summaryBadges?.forEach(badge => {
      if (/[$\u20AC\u00A3\u00A5\u20B9]/.test(badge.text)) {
        console.warn(`AI included monetary symbol in summary badge: "${badge.text}" against instructions.`);
      }
    });

    if (output.executiveSummary?.highlights?.length && output.executiveSummary?.highlights?.length !== 3) {
      console.warn("AI generated a number of highlights different from prompt guidance. Expected 3, got:", output.executiveSummary?.highlights?.length);
    }

    // Validate team members section
    if (teamCompositionData.length > 0 && output.teamAndResources) {
      if (!output.teamAndResources.teamMembers || output.teamAndResources.teamMembers.length === 0) {
        console.warn("AI did not generate team members despite team composition input.");
      }
    } else if (teamCompositionData.length === 0 && output.teamAndResources && (output.teamAndResources.teamMembers && output.teamAndResources.teamMembers.length > 0)) {
      console.warn("AI generated team members sections despite no team composition input.");
    }

    return output;
  }
);

