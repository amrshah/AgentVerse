'use server';

import { generateText } from '@/ai/client';
import { z } from 'zod';

const CreateAgentProfileInputSchema = z.object({
  roleDescription: z
    .string()
    .describe("A high-level description of the agent's role and responsibilities."),
});
export type CreateAgentProfileInput = z.infer<typeof CreateAgentProfileInputSchema>;

const CreateAgentProfileOutputSchema = z.object({
  agentProfile: z
    .string()
    .describe('A detailed profile for the agent, including specific objectives, constraints, and recommended tools.'),
});
export type CreateAgentProfileOutput = z.infer<typeof CreateAgentProfileOutputSchema>;

export async function createAgentProfile(input: CreateAgentProfileInput): Promise<CreateAgentProfileOutput> {
  const prompt = `You are an AI agent profile generator. Based on the high-level description of the agent's role and responsibilities provided by the user, you will generate a detailed profile for the agent. This profile should include specific objectives, constraints, and recommended tools. Please ensure the profile is well-structured and easy to understand.

Role Description: ${input.roleDescription}`;

  const text = await generateText({ prompt });
  return { agentProfile: text };
}
