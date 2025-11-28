'use server';

/**
 * @fileOverview A flow for running an orchestration of a team of agents.
 *
 * - runOrchestration - A function that orchestrates a team of agents to produce a result.
 * - RunOrchestrationInput - The input type for the runOrchestration function.
 * - RunOrchestrationOutput - The return type for the runOrchestration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgentSchema = z.object({
  name: z.string().describe('The name of the agent.'),
  role: z.string().describe('The role of the agent.'),
  objectives: z.string().describe('The objectives of the agent.'),
});

const RunOrchestrationInputSchema = z.object({
  teamName: z.string().describe('The name of the team.'),
  agents: z.array(AgentSchema).describe('The agents in the team.'),
  task: z.string().describe('The overall task for the team.'),
});
export type RunOrchestrationInput = z.infer<typeof RunOrchestrationInputSchema>;

const RunOrchestrationOutputSchema = z.object({
  result: z
    .string()
    .describe('The final result of the orchestration, formatted as Markdown.'),
});
export type RunOrchestrationOutput = z.infer<
  typeof RunOrchestrationOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'runOrchestrationPrompt',
  input: {schema: RunOrchestrationInputSchema},
  output: {format: 'text'},
  prompt: `You are a master orchestrator of AI agents. You will be given a team of agents, their roles, and their objectives, along with an overall task. Your job is to simulate the collaboration of these agents and produce a final result that reflects their combined efforts.

Your output should be a step-by-step narrative of their collaboration, formatted in Markdown. For each step, announce which agent is performing the action. For example: "**[Agent Name]**: [Action or thought process]".

The final output should be the completed task, but the process should show the agents working together.

Team: {{{teamName}}}
Task: {{{task}}}

Here are the agents in the team:
{{#each agents}}
- Name: {{{this.name}}}
  Role: {{{this.role}}}
  Objectives: {{{this.objectives}}}
{{/each}}

Based on this information, generate the step-by-step process and the final result of their work.
`,
});

export const runOrchestration = ai.defineFlow(
  {
    name: 'runOrchestrationFlow',
    inputSchema: RunOrchestrationInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {text} = await prompt(input);
    return text;
  }
);
