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
  industry: z.string().describe('The industry the project belongs to.'),
  businessObjectives: z.string().describe('The business objectives of the project.'),
  currentPainPoints: z.string().describe('The current pain points the project aims to solve, provided in bullet points.'),
  proposedSolution: z.string().describe('The proposed solution to address the pain points.'),
  timeline: z.string().describe('The timeline for the project, including milestones.'),
  budget: z.string().optional().describe('The budget for the project.'),
  teamSize: z.string().optional().describe('The size of the team working on the project.'),
  techStack: z.string().optional().describe('The technology stack to be used for the project.'),
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

  Company/Client Name: {{{companyClientName}}}
  Project Name: {{{projectName}}}
  Industry: {{{industry}}}
  Business Objectives: {{{businessObjectives}}}
  Current Pain Points: {{{currentPainPoints}}}
  Proposed Solution: {{{proposedSolution}}}
  Timeline: {{{timeline}}}
  {{#if budget}}Budget: {{{budget}}}{{/if}}
  {{#if teamSize}}Team Size: {{{teamSize}}}{{/if}}
  {{#if techStack}}Tech Stack: {{{techStack}}}{{/if}}
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
