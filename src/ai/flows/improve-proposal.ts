// This is an AI-powered code! Please review and test carefully.

'use server';

/**
 * @fileOverview Flow for improving a business proposal by re-generating specific sections.
 *
 * - improveProposal - A function that takes a business proposal and re-generates specified sections to improve it.
 * - ImproveProposalInput - The input type for the improveProposal function.
 * - ImproveProposalOutput - The return type for the improveProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveProposalInputSchema = z.object({
  proposal: z.string().describe('The complete business proposal to improve.'),
  sectionToImprove: z.string().describe('The specific section of the proposal to re-generate and improve.'),
  companyName: z.string().describe('The name of the company for which the proposal is being generated.'),
  projectName: z.string().describe('The name of the project for which the proposal is being generated.'),
  industry: z.string().describe('The industry of the company or project.'),
  businessObjectives: z.string().describe('The business objectives of the project.'),
  currentPainPoints: z.string().describe('The current pain points the project aims to address.'),
  proposedSolution: z.string().describe('The proposed solution in the current proposal.'),
  timeline: z.string().describe('The timeline for the proposed solution.'),
  budget: z.string().optional().describe('The budget for the project, if available.'),
  teamSize: z.string().optional().describe('The team size for the project, if available.'),
  techStack: z.string().optional().describe('The tech stack to be used for the project, if available.'),
});

export type ImproveProposalInput = z.infer<typeof ImproveProposalInputSchema>;

const ImproveProposalOutputSchema = z.object({
  improvedProposal: z.string().describe('The improved business proposal with the re-generated section.'),
});

export type ImproveProposalOutput = z.infer<typeof ImproveProposalOutputSchema>;

export async function improveProposal(input: ImproveProposalInput): Promise<ImproveProposalOutput> {
  return improveProposalFlow(input);
}

const improveProposalPrompt = ai.definePrompt({
  name: 'improveProposalPrompt',
  input: {schema: ImproveProposalInputSchema},
  output: {schema: ImproveProposalOutputSchema},
  prompt: `You are an expert business proposal writer. You will receive a business proposal and a specific section of that proposal to improve. Your goal is to re-generate and improve the specified section, incorporating the context of the entire proposal and additional information provided.

Company/Client Name: {{{companyName}}}
Project Name: {{{projectName}}}
Industry: {{{industry}}}
Business Objectives: {{{businessObjectives}}}
Current Pain Points: {{{currentPainPoints}}}
Proposed Solution: {{{proposedSolution}}}
Timeline: {{{timeline}}}
Budget: {{{budget}}}
Team Size: {{{teamSize}}}
Tech Stack: {{{techStack}}}

Current Proposal:
{{{proposal}}}

Section to Improve: {{{sectionToImprove}}}

Improved Section:
`, // Keep the Improved Section as the final output to allow LLM to generate and complete the proposal
});

const improveProposalFlow = ai.defineFlow(
  {
    name: 'improveProposalFlow',
    inputSchema: ImproveProposalInputSchema,
    outputSchema: ImproveProposalOutputSchema,
  },
  async input => {
    const {output} = await improveProposalPrompt(input);
    return {
      improvedProposal: output!.improvedProposal,
    };
  }
);
