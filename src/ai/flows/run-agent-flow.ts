'use server';

/**
 * @fileOverview A flow for running a single agent to perform a task.
 *
 * - runAgent - A function that executes a task for a single specified agent.
 * - RunAgentInput - The input type for the runAgent function.
 * - RunAgentOutput - The return type for the runAgent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AgentSchema = z.object({
  name: z.string().describe('The name of the agent.'),
  role: z.string().describe('The role of the agent.'),
  objectives: z.string().describe('The objectives of the agent.'),
});
export type Agent = z.infer<typeof AgentSchema>;

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

const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: RunAgentOutputSchema,
  },
  async input => {
    const promptText = `You are an AI agent. Act as this agent and execute the task.

Agent Name: ${input.agent.name}
Agent Role: ${input.agent.role}
Agent Objectives: ${input.agent.objectives}

Task:
${input.task}

Perform your part thoroughly and return your response in clean, professional Markdown.`;

    const response = await ai.generate({
      prompt: promptText,
    });

    let result = response.text || '';
    const codeMatch = result.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (codeMatch) result = codeMatch[1].trim();
    try {
      const parsed = JSON.parse(result);
      if (parsed && typeof parsed.result === 'string') result = parsed.result;
    } catch {}

    return { result };
  }
);
