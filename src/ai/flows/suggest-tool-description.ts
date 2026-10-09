'use server';

import { generateText } from '@/ai/client';
import { z } from 'zod';

const SuggestToolDescriptionInputSchema = z.object({
  toolDescription: z
    .string()
    .describe('A description of the tool for which a schema is to be suggested.'),
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
  const prompt = `You are an expert at creating JSON schemas to describe tools for use by AI agents.
Based on the following tool description, create a JSON schema that describes the input fields and parameters required for the tool.

Tool Description: ${input.toolDescription}

Return ONLY the JSON schema representation.`;

  const jsonSchema = await generateText({ prompt });
  return { jsonSchema };
}
