
'use server';
/**
 * @fileOverview Flow for improving a specific section of a structured business proposal.
 *
 * - improveSection - A function that takes a specific section's content, user instructions, and proposal context to generate improved content.
 * - ImproveSectionInput - The input type for the improveSection function.
 * - ImproveSectionOutput - The return type for the improveSection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ProposalSectionKey } from '@/components/proposal-view/ProposalViewLayout'; // Assuming this type export exists

const ImproveSectionInputSchema = z.object({
  sectionKey: z.string().describe("The key of the proposal section being edited (e.g., 'executiveSummary', 'requirementsAnalysis', 'featureBreakdown', 'projectTimelineSection', 'teamAndResources')."),
  currentSectionContent: z.string().describe("The current content of the section. This might be plain text or a JSON string for complex sections."),
  userPrompt: z.string().describe("The user's instructions for how to edit or improve the section."),
  proposalContext: z.object({
    proposalTitle: z.string().describe("The main title of the business proposal."),
    clientName: z.string().describe("The name of the client for whom the proposal is intended."),
    projectType: z.string().describe("The general type of the project (e.g., Web Application, AI Integration)."),
  }).describe("Overall context of the proposal to help the AI understand the editing task."),
});

export type ImproveSectionInput = z.infer<typeof ImproveSectionInputSchema>;

const ImproveSectionOutputSchema = z.object({
  improvedSectionContent: z.string().describe("The updated content for the section. This will be plain text or a JSON string, matching the format of currentSectionContent."),
});

export type ImproveSectionOutput = z.infer<typeof ImproveSectionOutputSchema>;

export async function improveSection(input: ImproveSectionInput): Promise<ImproveSectionOutput> {
  return improveSectionFlow(input);
}

const improveSectionGenkitPrompt = ai.definePrompt({
  name: 'improveSectionPrompt',
  input: {schema: ImproveSectionInputSchema},
  output: {schema: ImproveSectionOutputSchema},
  prompt: `You are an AI assistant helping to edit a business proposal.

Proposal Context:
- Title: {{{proposalContext.proposalTitle}}}
- Client: {{{proposalContext.clientName}}}
- Project Type: {{{proposalContext.projectType}}}

You are editing the "{{{sectionKey}}}" section.

Current content of the section:
\`\`\`
{{{currentSectionContent}}}
\`\`\`

The user wants to make the following changes:
"{{{userPrompt}}}"

Please provide ONLY the new, updated content for the "{{{sectionKey}}}" section based on the user's request.
- If the "Current content of the section" is a JSON object (even if provided as a string), ensure your output is also a valid JSON object string with the same overarching structure, updated according to the user's prompt.
- For 'executiveSummary', the structure is: \`{ summaryText: string, highlights: Array<{label: string, value: string, colorName: string}>, projectGoals: Array<{id: string, title: string, description: string}> }\`.
- For 'requirementsAnalysis', the structure is: \`{ projectRequirementsOverview: string, functionalRequirements: string[], nonFunctionalRequirements: string[] }\`.
- For 'featureBreakdown', the structure is: \`{ title: string, subtitle: string, features: Array<{ id: string, title: string, description: string, totalHours: string, tags?: Array<{text: string, colorScheme: string}>, functionalFeatures?: string[], nonFunctionalRequirements?: string[], resourceAllocation?: Array<{role: string, hours: string}> }> }\`. **IMPORTANT: For 'featureBreakdown', DO NOT include any price or cost estimations. Only provide time estimates in hours (e.g., "72 hours", "36h").**
- For 'projectTimelineSection', the structure is: \`{ title: string, phases: Array<{ id: string, title: string, description: string, duration: string, percentageOfProject?: string, keyDeliverables: string[] }> }\`. **For 'percentageOfProject', this refers to project effort/duration, NOT cost.**
- For 'teamAndResources', the structure is: \`{ teamAllocationTitle: string, teamAllocations: Array<{roleName: string, totalHours: string, duration: string, utilization: string}>, teamStructureTitle: string, teamStructure: Array<{roleName: string, responsibilities: string[]}> }\`. **IMPORTANT: For 'teamAndResources', DO NOT include 'Hourly Rate' or 'Total Cost' in teamAllocations.**
- If the "Current content of the section" is plain text, provide the updated plain text.
- Do not add any extra explanations, apologies, or conversational fluff like "Okay, here's the updated content:". Only output the section content itself.
- Pay close attention to maintaining the correct data type and structure for the section.

Updated "{{{sectionKey}}}" content:
`,
});

const improveSectionFlow = ai.defineFlow(
  {
    name: 'improveSectionFlow',
    inputSchema: ImproveSectionInputSchema,
    outputSchema: ImproveSectionOutputSchema,
  },
  async (input: ImproveSectionInput) : Promise<ImproveSectionOutput> => {
    const {output} = await improveSectionGenkitPrompt(input);
    if (!output?.improvedSectionContent) {
      throw new Error("AI failed to generate improved section content or returned empty content.");
    }
    
    // Basic validation for known JSON sections
    if (input.sectionKey === 'executiveSummary' || 
        input.sectionKey === 'requirementsAnalysis' || 
        input.sectionKey === 'featureBreakdown' ||
        input.sectionKey === 'projectTimelineSection' ||
        input.sectionKey === 'teamAndResources' // Added teamAndResources
       ) { 
        try {
            JSON.parse(output.improvedSectionContent);
        } catch (e) {
            console.error(`AI returned invalid JSON for ${input.sectionKey}:`, output.improvedSectionContent, e);
            throw new Error(`AI returned invalid JSON for section ${input.sectionKey}. Please try rephrasing your request, ensuring the AI maintains the required JSON structure.`);
        }
    }

    return {
        improvedSectionContent: output.improvedSectionContent,
    };
  }
);
