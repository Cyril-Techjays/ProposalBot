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
import {z}
from 'genkit';
import type { ProposalFormData } from '@/lib/types'; // For input mapping
import { StructuredProposalSchema, type StructuredProposal, type TeamMember } from '@/lib/types';

// Input schema remains the same as what ProposalForm provides
const GenerateProposalInputSchema = z.object({
  companyClientName: z.string().describe('The name of the company or client.'),
  projectName: z.string().describe('The name of the project.'),
  basicRequirements: z.string().describe('The basic requirements of the project, including features, target audience, etc.'),
  teamComposition: z.string().optional().describe('A comma-separated list of team roles required for the project (e.g., Frontend Developer, UI/UX Designer).'),
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
  output: {schema: StructuredProposalSchema}, // Use the new structured schema
  prompt: `You are an expert business proposal writer. Based on the information provided, generate a comprehensive and persuasive business proposal in a structured format.
**IMPORTANT RULE: Under no circumstances should any monetary values, costs, prices, or budgets be included in any part of the proposal. All estimates should be in terms of time (hours, weeks, months) or resource allocation (number of people, roles).**

Client Company Name: {{{companyClientName}}}
Project Name: {{{projectName}}}
Basic Requirements: {{{basicRequirements}}}

Team Composition (JSON String): {{{teamComposition}}}

**Instructions for Team Composition:**
- The 'Team Composition' input is a JSON string representing an array of team member objects. Each object has two fields: 'role' (string, e.g., "Frontend Developer") and 'seniority' (string, one of "Entry Level", "Mid Level", "Senior Level").
- **Crucially, parse this JSON string internally** to understand the exact list of team members and their seniority.
- Use this parsed list to accurately determine the total number of team members for summary badges and highlights.

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
    *   One for an estimated timeline (e.g., "2-3 months", icon: "Clock"). Infer a realistic timeline based on project scope and the detailed team composition/seniority.
    *   One for team members (e.g., "5 team members", icon: "Users2"). **Calculate the total number of team members directly from the provided 'Team Composition' JSON array.**
    *   **DO NOT create a budget badge or any badge with monetary values.**
5.  **executiveSummary**:
    *   **summaryText**: A concise overview (50-100 words) of the project, its purpose, and key outcomes. **Do not mention budget or cost.**
    *   **highlights**: Exactly 3 highlight items:
        *   Item 1: Label "Timeline", Value (estimated timeline, e.g., "2-3 months"), colorName: "green".
        *   Item 2: Label "Total Hours", Value (estimated total hours, e.g., "150-200h"). Estimate based on project scope and the detailed team composition/seniority. **No monetary value.**
        *   Item 3: Label "Team Size", Value (number of team members, e.g., "2 members"). **Calculate the total number of team members directly from the provided 'Team Composition' JSON array.**
    *   **projectGoals**: 2 to 5 project goals. Each goal needs an \`id\` (e.g., "goal-1"), \`title\`, and \`description\`.
6.  **requirementsAnalysis**:
    *   **projectRequirementsOverview**: A concise overview of the project requirements based on the provided 'Basic Requirements'. This should be 1-2 paragraphs.
    *   **functionalRequirements**: A list of 3 to 7 key functional requirements derived from the 'Basic Requirements'.
    *   **nonFunctionalRequirements**: A list of 3 to 7 key non-functional requirements.
7.  **featureBreakdown**:
    *   **title**: "Detailed Feature Breakdown"
    *   **subtitle**: "Complete analysis of all features with time estimates. Cost information is omitted."
    *   **features**: Generate 2 to 4 feature items. For each feature item:
        *   **id**: A unique string ID (e.g., "feat-auth", "feat-dashboard").
        *   **title**: A descriptive title for the feature (e.g., "User Authentication & Authorization", "Interactive Dashboard & Analytics").
        *   **description**: A short summary of the feature (e.g., "Secure user registration, login, role-based access control, and session management.").
        *   **totalHours**: An estimated total time for this feature in hours (e.g., "72 hours", "40-50 hours"). **DO NOT include cost.** Estimate based on the feature complexity and the detailed team composition/seniority.
        *   **tags**: (Optional) 1-2 tags. Each tag needs \`text\` (e.g., "High Priority", "Core Security") and \`colorScheme\` (e.g., "red", "blue", "gray", "green", "yellow", "indigo", "purple", "pink").
        *   **functionalFeatures**: (Optional) A list of 2-5 specific functional sub-features or points related to this main feature.
        *   **nonFunctionalRequirements**: (Optional) A list of 1-4 non-functional requirements specific to this feature.
        *   **resourceAllocation**: (Optional) For *each* unique role present in the 'Team Composition' JSON input, list an estimated time allocation for *this specific feature*, considering the number of individuals and their seniority. Each item needs \`role\` (e.g., "Frontend Developer") and \`hours\` (e.g., "30h for this feature"). The sum of hours for all roles on this feature should be reasonably aligned with the feature's \`totalHours\`. If a role from the team is not directly involved in this specific feature, you can omit it or assign a very small token amount of hours (e.g., "2h for consultation"). **DO NOT include cost.**
8.  **projectTimelineSection**:
    *   **title**: "Project Timeline & Phases" (or similar appropriate title).
    *   **phases**: Generate 3 to 5 project phases. For each phase:
        *   **id**: A unique string ID (e.g., "phase-discovery", "phase-design").
        *   **title**: A descriptive title for the phase (e.g., "Discovery & Requirements Analysis", "Design & Architecture", "Development Phase 1 (MVP)").
        *   **description**: A short summary of the activities in this phase (e.g., "Stakeholder interviews, requirement gathering, technical analysis, project scope definition.").
        *   **duration**: An estimated duration for this phase (e.g., "2-3 weeks", "1 month"). Estimate based on project scope and the detailed team composition/seniority.
        *   **percentageOfProject**: (Optional) An estimated percentage of the total project effort or duration this phase represents (e.g., "15% of project", "20% of project effort"). **This is NOT about cost.**
        *   **keyDeliverables**: A list of 2-5 key deliverables for this phase (e.g., "Requirements Document", "UI/UX Mockups", "Deployed MVP").
9.  **teamAndResources**:
    *   **sectionTitle**: "Project Team & Resources". // Updated title key
    *   **teamMembers**: An array. For *each individual team member object* in the parsed 'Team Composition' JSON array, create a corresponding object in this 'teamMembers' array.
        *   Each object in 'teamMembers' must have the following fields:
            *   **id**: A unique string ID for this entry. You can use the original ID from the input team member object.
            *   **roleName**: Copy the 'role' value from the input team member object.
            *   **seniority**: Copy the 'seniority' value from the input team member object.
            *   **totalHours**: Generate a realistic estimate of total hours for this *individual*, considering their role and seniority and the overall project scope. **No monetary value.**
            *   **duration**: Generate a realistic estimate of the duration this *individual* will be involved. **No monetary value.**
            *   **utilization**: Generate a realistic estimate of the utilization percentage for this *individual*. **No monetary value.**
            *   **responsibilities**: Generate a list of 2-5 key responsibilities for this *individual*, tailored to their role and seniority.
        *   **Ensure the 'teamMembers' array in your output contains one entry for every individual team member provided in the 'Team Composition' input JSON string.**

Ensure all text content is well-written, professional, and tailored to the input.
The \`summaryText\` for the executive summary should incorporate the client name, project name, project type, timeline, and team size information naturally. **Do not mention budget or cost.**
For numerical values like hours, provide reasonable estimates based on project scope and the detailed team composition/seniority.
The projectType should be a concise phrase.
The team members count for the summary badge and highlights should be the exact count of items in the parsed 'Team Composition' JSON array.
Total hours highlight should be a range like "150-200h" or a single figure like "170h", estimated based on project scope and the detailed team composition/seniority.
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
    const {output} = await generateProposalPrompt(input);
    
    // Add logging for the raw AI output
    console.log("Raw AI Output:", JSON.stringify(output, null, 2));

    if (!output) {
      throw new Error("AI failed to generate a structured proposal.");
    }
    
    // Parse the teamComposition JSON string
    let teamCompositionData: TeamMember[] = [];
    if (input.teamComposition) {
      try {
        // Ensure the parsed data is treated as an array of TeamMember
        const parsed = JSON.parse(input.teamComposition);
        if (Array.isArray(parsed)) {
             // Basic structural check - refine if necessary
            teamCompositionData = parsed.filter(item => 
                 item && typeof item === 'object' 
                 && typeof item.role === 'string' 
                 && typeof item.seniority === 'string'
            ) as TeamMember[];
        }
      } catch (e) {
        console.error("Error parsing teamComposition JSON string:", e);
        // Decide how to handle parsing errors - maybe proceed with empty team data or throw error
        // For now, we'll just log and proceed with empty data
      }
    }

    // Basic validation checks based on prompt guidance (not strict schema anymore)
    if (output.summaryBadges?.length && output.summaryBadges?.length !== 2) { // Expect 2 badges
        console.warn("AI generated a number of summary badges different from prompt guidance. Expected 2, got:", output.summaryBadges?.length);
    }
     // Check for dollar signs or known currency symbols in summary badge text
    output.summaryBadges?.forEach(badge => {
        if (/[$\u20AC\u00A3\u00A5\u20B9]/.test(badge.text)) { // $, €, £, ¥, ₹
            console.warn(`AI included monetary symbol in summary badge: "${badge.text}" against instructions.`);
            // Potentially modify or remove the badge here if strict adherence is critical
        }
    });

    if (output.executiveSummary?.highlights?.length && output.executiveSummary?.highlights?.length !== 3) { 
        console.warn("AI generated a number of highlights different from prompt guidance. Expected 3, got:", output.executiveSummary?.highlights?.length);
    }
    
    // Now using the parsed teamCompositionData array for validation reference
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

