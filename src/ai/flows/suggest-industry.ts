'use server';

/**
 * @fileOverview Suggests industries based on the company name.
 *
 * - suggestIndustry - A function that suggests industries based on the company name.
 * - SuggestIndustryInput - The input type for the suggestIndustry function.
 * - SuggestIndustryOutput - The return type for the suggestIndustry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIndustryInputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
});
export type SuggestIndustryInput = z.infer<typeof SuggestIndustryInputSchema>;

const SuggestIndustryOutputSchema = z.object({
  industries: z.array(z.string()).describe('A list of suggested industries.'),
});
export type SuggestIndustryOutput = z.infer<typeof SuggestIndustryOutputSchema>;

export async function suggestIndustry(input: SuggestIndustryInput): Promise<SuggestIndustryOutput> {
  return suggestIndustryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIndustryPrompt',
  input: {schema: SuggestIndustryInputSchema},
  output: {schema: SuggestIndustryOutputSchema},
  prompt: `Suggest industries for the company named {{{companyName}}}. Return a JSON array of strings.`,
});

const suggestIndustryFlow = ai.defineFlow(
  {
    name: 'suggestIndustryFlow',
    inputSchema: SuggestIndustryInputSchema,
    outputSchema: SuggestIndustryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
