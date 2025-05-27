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
import { StructuredProposalSchema, type StructuredProposal } from '@/lib/types';

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

Client Company Name: {{{companyClientName}}}
Project Name: {{{projectName}}}
Basic Requirements: {{{basicRequirements}}}
{{#if teamComposition}}Team Composition: {{{teamComposition}}}{{/if}}

Please provide the output in the following JSON structure. Ensure all fields are populated accurately and professionally.

**Output Structure Guidance:**

1.  **proposalTitle**: Combine Project Name and "Comprehensive Proposal". Example: "{{{projectName}}} - Comprehensive Proposal".
2.  **clientName**: Use "{{{companyClientName}}}".
3.  **projectType**: Infer from basic requirements (e.g., "Web Application", "Mobile App Development", "AI Integration Project").
4.  **summaryBadges**: Create exactly 3 badges:
    *   One for an estimated timeline (e.g., "2-3 months", icon: "Clock"). Infer a realistic timeline.
    *   One for team members (e.g., "1 team members", icon: "Users2"). Count from \`teamComposition\` if provided, otherwise estimate 1-3.
    *   One for an estimated budget (e.g., "$10,000 - $15,000", icon: "DollarSign"). Infer a reasonable budget range based on requirements and team.
5.  **executiveSummary**:
    *   **summaryText**: A concise overview (50-100 words) of the project, its purpose, and key outcomes.
    *   **highlights**: Exactly 3 highlight items. Provide a \`colorName\` hint for each.
        *   Item 1: Label "Timeline", Value (estimated timeline, e.g., "2-3 months"), colorName: "green".
        *   Item 2: Label "Total Hours", Value (estimated total hours, e.g., "150-200h"), colorName: "purple".
        *   Item 3: Label "Team Size", Value (number of team members, e.g., "2 members"), colorName: "orange".
    *   **projectGoals**: 2 to 5 project goals. Each goal needs an \`id\` (e.g., "goal-1"), \`title\`, and \`description\`.
        *   Example Goal: { id: "goal-1", title: "Deliver a Scalable Solution", description: "Build a robust web application that can handle growth and future enhancements." }
6.  **requirementsAnalysis**:
    *   **projectRequirementsOverview**: A concise overview of the project requirements based on the provided 'Basic Requirements'. This should be 1-2 paragraphs.
    *   **functionalRequirements**: A list of 3 to 7 key functional requirements derived from the 'Basic Requirements'. Each item should be a concise string. Examples: "User Authentication & Authorization", "Dashboard & Analytics".
    *   **nonFunctionalRequirements**: A list of 3 to 7 key non-functional requirements. Examples: "Security & Data Protection", "Performance & Scalability".
7.  **featureBreakdown**:
    *   **content**: Detailed breakdown of key features and functionalities (2-3 paragraphs).
8.  **projectTimelineSection**:
    *   **content**: More detailed project timeline, possibly mentioning phases (2-3 paragraphs).
9.  **teamAndResources**:
    *   **content**: Description of the proposed team and resources (2-3 paragraphs). If \`teamComposition\` is provided, use it.

Ensure all text content is well-written, professional, and tailored to the input.
The \`summaryText\` for the executive summary should incorporate the client name, project name, project type, timeline, team size, and budget information naturally.
For numerical values like budget and hours, provide reasonable estimates if not directly calculable from input.
The projectType should be a concise phrase.
The team members count for the summary badge should be a number.
The team size for the executive summary highlight should be like "X members".
The budget for the summary badge can be a range or a single figure.
Total hours highlight should be a range like "150-200h" or a single figure like "170h".
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
    if (!output) {
      throw new Error("AI failed to generate a structured proposal.");
    }
    // Ensure summaryBadges has 3 items, highlights has 3, projectGoals has 2-5
    // This is a basic structural validation, more complex validation could be added
    if (output.summaryBadges?.length !== 3) {
        console.warn("AI generated incorrect number of summary badges. Expected 3, got:", output.summaryBadges?.length);
        // Potentially fix or throw error - for now, let it pass but log
    }
    if (output.executiveSummary?.highlights?.length !== 3) { // Changed from 4 to 3
        console.warn("AI generated incorrect number of highlights. Expected 3, got:", output.executiveSummary?.highlights?.length);
    }
    if (output.executiveSummary?.projectGoals?.length < 2 || output.executiveSummary?.projectGoals?.length > 5) {
        console.warn("AI generated incorrect number of project goals. Expected 2-5, got:", output.executiveSummary?.projectGoals?.length);
    }
    if (output.requirementsAnalysis?.functionalRequirements?.length < 3 || output.requirementsAnalysis?.functionalRequirements?.length > 7) {
        console.warn("AI generated incorrect number of functional requirements. Expected 3-7, got:", output.requirementsAnalysis?.functionalRequirements?.length);
    }
     if (output.requirementsAnalysis?.nonFunctionalRequirements?.length < 3 || output.requirementsAnalysis?.nonFunctionalRequirements?.length > 7) {
        console.warn("AI generated incorrect number of non-functional requirements. Expected 3-7, got:", output.requirementsAnalysis?.nonFunctionalRequirements?.length);
    }


    return output;
  }
);
