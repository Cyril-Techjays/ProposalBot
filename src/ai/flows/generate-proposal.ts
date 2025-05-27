// src/ai/flows/generate-proposal.ts
'use server';

/**
 * @fileOverview Generates a business proposal based on user inputs from a form.
 *
 * - generateProposal - A function that generates a business proposal.
 * - GenerateProposalInput - The input type for the generateProposal function.
 * - GenerateProposalOutput - The return type for the generateProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProposalInputSchema = z.object({
  companyClientName: z.string().describe('The name of the company or client.'),
  projectName: z.string().describe('The name of the project.'),
  basicRequirements: z.string().describe('The basic requirements of the project, including features, target audience, etc.'),
  teamComposition: z.string().optional().describe('A comma-separated list of team roles required for the project (e.g., Frontend Developer, UI/UX Designer).'),
});

export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

const GenerateProposalOutputSchema = z.object({
  proposal: z.string().describe('The generated business proposal.'),
});

export type GenerateProposalOutput = z.infer<typeof GenerateProposalOutputSchema>;

export async function generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
  return generateProposalFlow(input);
}

const generateProposalPrompt = ai.definePrompt({
  name: 'generateProposalPrompt',
  input: {schema: GenerateProposalInputSchema},
  output: {schema: GenerateProposalOutputSchema},
  prompt: `You are an expert business proposal writer. Based on the information provided, generate a comprehensive and persuasive business proposal.

Client Company Name: {{{companyClientName}}}
Project Name: {{{projectName}}}
Basic Requirements: {{{basicRequirements}}}
{{#if teamComposition}}Team Composition: {{{teamComposition}}}{{/if}}

Structure the proposal logically with clear sections (e.g., Introduction, Project Understanding, Proposed Solution, Team, Next Steps).
Be professional and persuasive.
`,
});

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: GenerateProposalOutputSchema,
  },
  async input => {
    const {output} = await generateProposalPrompt(input);
    return output!;
  }
);
