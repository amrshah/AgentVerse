'use server';

/**
 * @fileOverview A flow for running a single agent to perform a task.
 *
 * - runAgent - A function that executes a task for a single specified agent.
 * - RunAgentInput - The input type for the runAgent function.
 * - RunAgentOutput - The return type for the runAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgentSchema = z.object({
  name: z.string().describe('The name of the agent.'),
  role: z.string().describe('The role of the agent.'),
  objectives: z.string().describe('The objectives of the agent.'),
});

const RunAgentInputSchema = z.object({
  agent: AgentSchema.describe('The agent that will perform the task.'),
  task: z.string().describe('The task for the agent to perform.'),
});
export type RunAgentInput = z.infer<typeof RunAgentInputSchema>;

const RunAgentOutputSchema = z.object({
  result: z
    .string()
    .describe('The final result of the agent\'s work, formatted as Markdown.'),
});
export type RunAgentOutput = z.infer<typeof RunAgentOutputSchema>;

export async function runAgent(
  input: RunAgentInput
): Promise<RunAgentOutput> {
  return runAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runAgentPrompt',
  input: {schema: RunAgentInputSchema},
  output: {schema: RunAgentOutputSchema},
  prompt: `You are an AI agent executor. You will receive the profile of an agent and a task to perform. Your job is to act as that agent and execute the task.

Agent Name: {{{agent.name}}}
Agent Role: {{{agent.role}}}
Agent Objectives: {{{agent.objectives}}}

Task: {{{task}}}

Based on this information, perform the task as the specified agent and return the result in Markdown format.
`,
});

const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: RunAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
