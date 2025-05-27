
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
  sectionKey: z.string().describe("The key of the proposal section being edited (e.g., 'executiveSummary', 'requirementsAnalysis')."),
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
- If the "Current content of the section" is plain text, provide the updated plain text.
- Do not add any extra explanations, apologies, or conversational fluff like "Okay, here's the updated content:". Only output the section content itself.
- Pay close attention to maintaining the correct data type and structure for the section. For example, if the section is 'executiveSummary', it has a specific JSON structure that must be preserved.

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
    // Log the input for easier debugging if necessary
    // console.log('improveSectionFlow input:', JSON.stringify(input, null, 2));

    const {output} = await improveSectionGenkitPrompt(input);
    if (!output?.improvedSectionContent) {
      // console.error('AI failed to generate improved section content. Raw output:', output);
      throw new Error("AI failed to generate improved section content or returned empty content.");
    }
    
    // Basic validation: if the original was JSON, try to parse the new one.
    // This is a light check; more robust validation might be needed depending on AI reliability.
    if (input.sectionKey === 'executiveSummary') { // Example check for a known JSON section
        try {
            JSON.parse(output.improvedSectionContent);
        } catch (e) {
            // console.error("AI returned invalid JSON for executiveSummary:", output.improvedSectionContent, e);
            // Optionally, you could try to ask the AI to fix it here, or just throw.
            throw new Error(`AI returned invalid JSON for section ${input.sectionKey}. Please try rephrasing your request.`);
        }
    }

    return {
        improvedSectionContent: output.improvedSectionContent,
    };
  }
);
