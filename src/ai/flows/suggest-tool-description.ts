'use server';

/**
 * @fileOverview Tool description suggestion flow.
 *
 * This flow takes a user-provided description of a tool and suggests a JSON schema for it.
 * - suggestToolDescription - Function to generate a tool description suggestion.
 * - SuggestToolDescriptionInput - Input type for the suggestToolDescription function.
 * - SuggestToolDescriptionOutput - Output type for the suggestToolDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { GenkitConfig } from '@/lib/types';
import { googleAI } from '@genkit-ai/google-genai';

const SuggestToolDescriptionInputSchema = z.object({
  toolDescription: z
    .string()
    .describe('A description of the tool for which a schema is to be suggested.'),
  config: z.optional(z.any()),
});
export type SuggestToolDescriptionInput = z.infer<
  typeof SuggestToolDescriptionInputSchema
>;

const SuggestToolDescriptionOutputSchema = z.object({
  jsonSchema: z
    .string()
    .describe(
      'A JSON schema that describes the input fields and authorizations required for the tool.'
    ),
});
export type SuggestToolDescriptionOutput = z.infer<
  typeof SuggestToolDescriptionOutputSchema
>;

export async function suggestToolDescription(
  input: SuggestToolDescriptionInput
): Promise<SuggestToolDescriptionOutput> {
  return suggestToolDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestToolDescriptionPrompt',
  input: {schema: SuggestToolDescriptionInputSchema},
  output: {schema: SuggestToolDescriptionOutputSchema},
  prompt: `You are an expert at creating JSON schemas to describe tools for use by AI agents.

  Based on the following tool description, create a JSON schema that describes the input fields and authorizations required for the tool.

  Tool Description: {{{toolDescription}}}
  `,
});

const suggestToolDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestToolDescriptionFlow',
    inputSchema: SuggestToolDescriptionInputSchema,
    outputSchema: SuggestToolDescriptionOutputSchema,
  },
  async input => {
    const { config } = input;
    const model = config?.model ? googleAI.model(config.model) : ai.model;

    const {output} = await model.generate({
        prompt: prompt.prompt,
        input: { toolDescription: input.toolDescription },
        output: { schema: SuggestToolDescriptionOutputSchema },
        config: {
            temperature: config?.temperature,
            topK: config?.topK,
            topP: config?.topP,
        }
    });

    return output!;
  }
);
