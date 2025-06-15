'use server';

/**
 * @fileOverview Provides AI-powered suggestions for optimal stand configurations based on client needs.
 *
 * - suggestStandConfiguration - A function that suggests stand configurations.
 * - SuggestStandConfigurationInput - The input type for the suggestStandConfiguration function.
 * - SuggestStandConfigurationOutput - The return type for the suggestStandConfiguration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStandConfigurationInputSchema = z.object({
  numberOfAttendees: z
    .number()
    .describe('The estimated number of attendees the client expects.'),
  spaceRequirements: z
    .string()
    .describe('The client’s space requirements (e.g., small, medium, large).'),
  budget: z.number().describe('The client’s budget in MUR.'),
});
export type SuggestStandConfigurationInput = z.infer<
  typeof SuggestStandConfigurationInputSchema
>;

const SuggestStandConfigurationOutputSchema = z.object({
  suggestedConfiguration: z
    .string()
    .describe('The AI-suggested stand configuration based on the input parameters.'),
  reasoning: z
    .string()
    .describe('The AI’s reasoning for the suggested configuration.'),
});
export type SuggestStandConfigurationOutput = z.infer<
  typeof SuggestStandConfigurationOutputSchema
>;

export async function suggestStandConfiguration(
  input: SuggestStandConfigurationInput
): Promise<SuggestStandConfigurationOutput> {
  return suggestStandConfigurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStandConfigurationPrompt',
  input: {schema: SuggestStandConfigurationInputSchema},
  output: {schema: SuggestStandConfigurationOutputSchema},
  prompt: `You are an expert in exhibition stand configurations.
Given the following information about a potential client, suggest an optimal stand configuration and explain your reasoning.

Number of Attendees: {{{numberOfAttendees}}}
Space Requirements: {{{spaceRequirements}}}
Budget (MUR): {{{budget}}}

Consider the available stand types and their pricing:

Type of Stand | Number available | Minimum Area | Unit Price (MUR) | Remarks
---|---|---|---|---
SME Skybridge | 60 | 9m² | 15,000.00 |
Souk Zone | 14 | 9m² | 45,000.00 |
Regional Pavillons | 6 | <200m² - 15 Stands Max | 1,200,000.00
Main Expo | 30 | 9m² | 90,000.00
Foodcourt Cooking Stations | 12 | 9m² | 20,000.00 | Revenue sharing 70/30
Gastronomic Pavillons | 3 | <300m² | 1,400,000 |

Provide a configuration suggestion and explain your reasoning, making sure to stay within the client's budget. Focus on maximizing value for the client, given their constraints.
`,
});

const suggestStandConfigurationFlow = ai.defineFlow(
  {
    name: 'suggestStandConfigurationFlow',
    inputSchema: SuggestStandConfigurationInputSchema,
    outputSchema: SuggestStandConfigurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
