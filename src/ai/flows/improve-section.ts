
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
**IMPORTANT RULE: Under no circumstances should any monetary values, costs, prices, or budgets be introduced or included in your response. All estimates must be in terms of time (hours, weeks, months) or resource allocation (number of people, roles).**

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
- For 'executiveSummary', the structure is: \`{ summaryText: string, highlights: Array<{label: string, value: string, colorName: string}>, projectGoals: Array<{id: string, title: string, description: string}> }\`. The 'highlights' array should have exactly 3 items: Timeline, Total Hours, Team Size. **No monetary values in summaryText or highlights.**
- For 'requirementsAnalysis', the structure is: \`{ projectRequirementsOverview: string, functionalRequirements: string[], nonFunctionalRequirements: string[] }\`.
- For 'featureBreakdown', the structure is: \`{ title: string, subtitle: string, features: Array<{ id: string, title: string, description: string, totalHours: string, tags?: Array<{text: string, colorScheme: string}>, functionalFeatures?: string[], nonFunctionalRequirements?: string[], resourceAllocation?: Array<{role: string, hours: string}> }> }\`. For \`resourceAllocation\` within each feature, try to include an estimate for each relevant project role. **IMPORTANT: For 'featureBreakdown', DO NOT include any price or cost estimations. Only provide time estimates in hours (e.g., "72 hours", "36h").**
- For 'projectTimelineSection', the structure is: \`{ title: string, phases: Array<{ id: string, title: string, description: string, duration: string, percentageOfProject?: string, keyDeliverables: string[] }> }\`. **For 'percentageOfProject', this refers to project effort/duration, NOT cost.**
- For 'teamAndResources', the structure is: \`{ teamAllocationTitle: string, teamAllocations: Array<{roleName: string, totalHours: string, duration: string, utilization: string}>, teamStructureTitle: string, teamStructure: Array<{roleName: string, responsibilities: string[]}> }\`. **IMPORTANT: For 'teamAndResources', DO NOT include 'Hourly Rate' or 'Total Cost' in teamAllocations.**
- If the "Current content of the section" is plain text, provide the updated plain text.
- Do not add any extra explanations, apologies, or conversational fluff like "Okay, here's the updated content:". Only output the section content itself.
- Pay close attention to maintaining the correct data type and structure for the section.
**CRITICAL:** Your response for the updated section content *must* be a single, valid JSON string if the section is structured (like executiveSummary, featureBreakdown, etc.), or plain text if it's a simple text field. Do not include any other text, explanations, or markdown formatting like \`\`\`json ... \`\`\` around the JSON string itself.

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
    const {output: rawPromptOutputObject} = await improveSectionGenkitPrompt(input);

    if (!rawPromptOutputObject || typeof rawPromptOutputObject.improvedSectionContent !== 'string') {
      let reason = "reason: unknown (rawPromptOutputObject existed, but improvedSectionContent was not a string)";
      if (!rawPromptOutputObject) {
        reason = "reason: The entire output object from the AI prompt was null or undefined.";
      } else if (rawPromptOutputObject.improvedSectionContent === undefined) {
        reason = "reason: The 'improvedSectionContent' field was undefined in the AI prompt's output object.";
      } else if (rawPromptOutputObject.improvedSectionContent === null) {
        reason = "reason: The 'improvedSectionContent' field was null in the AI prompt's output object.";
      } else {
        // This case means improvedSectionContent was present but not a string
        reason = `reason: The 'improvedSectionContent' field was present in the AI prompt's output object, but it was not a string (type: ${typeof rawPromptOutputObject.improvedSectionContent}). Value: ${String(rawPromptOutputObject.improvedSectionContent).substring(0,100)}`;
      }
      
      console.warn(`AI_FLOW_WARN: AI prompt for 'improveSectionPrompt' did not return a usable string for 'improvedSectionContent'. ${reason}. Input: ${JSON.stringify(input)}`);
      throw new Error(`AI_FLOW_ERROR_PROMPT_OUTPUT_INVALID: AI failed to provide usable string content for the section. ${reason}`);
    }
    
    // At this point, rawPromptOutputObject.improvedSectionContent is guaranteed to be a string.
    let processedContent = rawPromptOutputObject.improvedSectionContent; 

    // Clean markdown code fences
    const jsonMarkdownMatch = processedContent.match(/```json\s*([\s\S]*?)\s*```/s);
    if (jsonMarkdownMatch && jsonMarkdownMatch[1]) {
      processedContent = jsonMarkdownMatch[1];
    }
    processedContent = processedContent.trim();

    const isJsonSection = [
        'executiveSummary', 
        'requirementsAnalysis', 
        'featureBreakdown',
        'projectTimelineSection',
        'teamAndResources'
    ].includes(input.sectionKey);

    if (isJsonSection) {
        if (processedContent === "") { // Handle empty string for JSON sections explicitly
            console.warn(`AI_FLOW_WARN: AI returned an empty string for JSON section '${input.sectionKey}'. This will likely cause a parsing error. User prompt: "${input.userPrompt}"`);
            throw new Error(`AI_FLOW_ERROR_EMPTY_JSON_STRING: The AI returned an empty string for the '${input.sectionKey}' section, which is not valid JSON. Please ask the AI to provide valid JSON content.`);
        }
        try {
            const parsedData = JSON.parse(processedContent); 

            // Perform specific validations/cleanups if needed for certain sections (e.g., monetary symbols)
            if (input.sectionKey === 'executiveSummary') {
                if (parsedData.summaryText && /[$\u20AC\u00A3\u00A5\u20B9]/.test(parsedData.summaryText)) {
                    console.warn("AI_FLOW_WARN: AI included monetary symbol in executiveSummary.summaryText after edit.");
                }
                parsedData.highlights?.forEach((highlight: any) => {
                    if (highlight.value && /[$\u20AC\u00A3\u00A5\u20B9]/.test(highlight.value)) {
                        console.warn(`AI_FLOW_WARN: AI included monetary symbol in executiveSummary.highlight value "${highlight.value}" after edit.`);
                    }
                });
                if (parsedData.highlights && parsedData.highlights.length !== 3) {
                    console.warn(`AI_FLOW_WARN: AI edited executiveSummary highlights to have ${parsedData.highlights.length} items. Expected 3.`);
                }
            }
            // Add similar checks for other sections if monetary values are a concern.
            
            processedContent = JSON.stringify(parsedData); // Re-serialize to ensure canonical JSON string

        } catch (e: any) {
            console.error(
              `AI_FLOW_ERROR: AI returned invalid JSON for section '${input.sectionKey}'. User prompt: "${input.userPrompt}". Original AI Output (after markdown strip/trim): <<<${processedContent}>>>`, 
              e
            );
            throw new Error(
              `AI_FLOW_ERROR_JSON_PARSE_FAILED: The AI's response for the '${input.sectionKey}' section was not valid JSON and could not be parsed. AI Output Snippet: "${processedContent.substring(0, 100)}${processedContent.length > 100 ? '...' : ''}". Original error: ${e.message}`
            );
        }
    }

    // Final check, though type safety should mostly handle this now.
    if (typeof processedContent !== 'string') {
        console.error("AI_FLOW_CRITICAL_ERROR: processedContent somehow became non-string before returning. This should not happen. Original prompt output was:", rawPromptOutputObject.improvedSectionContent);
        throw new Error("AI_FLOW_ERROR_INTERNAL_TYPE: Internal error processing AI content; final content was not a string.");
    }

    return {
        improvedSectionContent: processedContent, 
    };
  }
);

