'use server';

/**
 * @fileOverview A flow for creating an agent profile with GenAI assistance.
 *
 * - createAgentProfile - A function that creates an agent profile based on a high-level description using GenAI.
 * - CreateAgentProfileInput - The input type for the createAgentProfile function.
 * - CreateAgentProfileOutput - The return type for the createAgentProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { GenkitConfig } from '@/lib/types';
import { googleAI } from '@genkit-ai/google-genai';

const CreateAgentProfileInputSchema = z.object({
  roleDescription: z
    .string()
    .describe('A high-level description of the agent\'s role and responsibilities.'),
  config: z.optional(z.any()),
});
export type CreateAgentProfileInput = z.infer<typeof CreateAgentProfileInputSchema>;

const CreateAgentProfileOutputSchema = z.object({
  agentProfile: z
    .string()
    .describe('A detailed profile for the agent, including specific objectives, constraints, and recommended tools.'),
});
export type CreateAgentProfileOutput = z.infer<typeof CreateAgentProfileOutputSchema>;

export async function createAgentProfile(input: CreateAgentProfileInput): Promise<CreateAgentProfileOutput> {
  return createAgentProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAgentProfilePrompt',
  input: {schema: CreateAgentProfileInputSchema},
  output: {schema: CreateAgentProfileOutputSchema},
  prompt: `You are an AI agent profile generator. Based on the high-level description of the agent's role and responsibilities provided by the user, you will generate a detailed profile for the agent. This profile should include specific objectives, constraints, and recommended tools. Please ensure the profile is well-structured and easy to understand.

Role Description: {{{roleDescription}}}`,
});

const createAgentProfileFlow = ai.defineFlow(
  {
    name: 'createAgentProfileFlow',
    inputSchema: CreateAgentProfileInputSchema,
    outputSchema: CreateAgentProfileOutputSchema,
  },
  async input => {
    const { config } = input;
    const model = config?.model ? googleAI.model(config.model) : ai.model;

    const {output} = await model.generate({
        prompt: prompt.prompt,
        input: { roleDescription: input.roleDescription },
        output: { schema: CreateAgentProfileOutputSchema },
        config: {
            temperature: config?.temperature,
            topK: config?.topK,
            topP: config?.topP,
        }
    });
    
    return output!;
  }
);
