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

export async function runOrchestration(
  input: RunOrchestrationInput
): Promise<RunOrchestrationOutput> {
  return runOrchestrationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runOrchestrationPrompt',
  input: {schema: RunOrchestrationInputSchema},
  output: {schema: RunOrchestrationOutputSchema},
  prompt: `You are a master orchestrator of AI agents. Your job is to create a plan to accomplish a given task and then orchestrate a team of AI agents to execute that plan.

First, you will be given a team of agents, their roles, and their objectives, along with an overall task.

Team: {{{teamName}}}
Task: {{{task}}}

Here are the agents in the team:
{{#each agents}}
- Name: {{{this.name}}}
  Role: {{{this.role}}}
  Objectives: {{{this.objectives}}}
{{/each}}

Based on this information, you must first create a step-by-step execution plan. The plan should be clear, logical, and delegate tasks to the most appropriate agent(s).

Then, you must simulate the execution of this plan, showing the collaboration between the agents. The final output should be the result of the completed task, formatted in Markdown. For example, if the task is to write an article, the final output should be the article itself, not the plan. The plan is your internal thought process.

Generate the final result of their work.
`,
});

const runOrchestrationFlow = ai.defineFlow(
  {
    name: 'runOrchestrationFlow',
    inputSchema: RunOrchestrationInputSchema,
    outputSchema: RunOrchestrationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
