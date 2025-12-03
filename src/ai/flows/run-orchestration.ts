
'use server';

/**
 * @fileOverview A flow for running an orchestration of a team of agents.
 *
 * - runOrchestration - A function that orchestrates a team of agents to produce a result.
 * - RunOrchestrationInput - The input type for the runOrchestration function.
 * - RunOrchestrationOutput - The return type for the runOrchestration function.
 */

import {ai} from '@/ai/genkit';
import {runAgent} from '@/ai/flows/run-agent-flow';
import {z} from 'genkit';

const AgentSchema = z.object({
  name: z.string().describe('The name of the agent.'),
  role: z.string().describe('The role of the agent.'),
  objectives: z.string().describe('The objectives of the agent.'),
});
export type Agent = z.infer<typeof AgentSchema>;

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

// Define a tool for the orchestrator to delegate tasks to other agents
const runAgentTool = ai.defineTool(
  {
    name: 'runAgent',
    description: 'Delegates a specific task to a designated agent in the team.',
    inputSchema: z.object({
      agentName: z.string().describe("The name of the agent to run, which must be one of the available agents in the team."),
      task: z.string().describe("The specific task for the agent to perform."),
    }),
    outputSchema: z.string().describe("The result of the agent's work."),
  },
  async ({ agentName, task }) => {
    // Find the full agent profile from the input agents list
    const agent = (runOrchestrationFlow.input()!.agents as Agent[]).find(a => a.name === agentName);
    if (!agent) {
      return `Error: Agent "${agentName}" not found in the team.`;
    }
    const response = await runAgent({ agent, task });
    return response.result;
  }
);


export async function runOrchestration(
  input: RunOrchestrationInput
): Promise<RunOrchestrationOutput> {
  return runOrchestrationFlow(input);
}

const runOrchestrationPrompt = ai.definePrompt({
  name: 'runOrchestrationPrompt',
  input: {schema: RunOrchestrationInputSchema},
  output: {schema: RunOrchestrationOutputSchema},
  tools: [runAgentTool],
  prompt: `You are a master orchestrator of AI agents. Your job is to create a plan to accomplish a given task and then execute that plan by orchestrating a team of AI agents.

First, you will be given a team of agents, their roles, and their objectives, along with an overall task.

Team: {{{teamName}}}
Task: {{{task}}}

Here are the agents in your team:
{{#each agents}}
- {{{this.name}}} ({{{this.role}}}): {{{this.objectives}}}
{{/each}}

Your process is as follows:
1.  **Analyze and Plan**: Based on the team and the task, create a logical, step-by-step execution plan. For each step, determine which agent is best suited for the task.
2.  **Execute**: Use the 'runAgent' tool to delegate each task to the appropriate agent. The output from one step can be used as context for the next. You may need to call agents multiple times.
3.  **Synthesize**: After all steps are complete, review the outputs from the agents and compile them into a final, comprehensive result that fulfills the original task.

Do not simulate the work. You must use the 'runAgent' tool to get results from the agents.

Begin execution. Produce the final, synthesized result in Markdown format.
`,
});

const runOrchestrationFlow = ai.defineFlow(
  {
    name: 'runOrchestrationFlow',
    inputSchema: RunOrchestrationInputSchema,
    outputSchema: RunOrchestrationOutputSchema,
  },
  async input => {
    // We bind the input to the flow's context so the tool can access it.
    // This is a workaround to give the tool access to the full agent list.
    const boundFlow = {...runOrchestrationFlow, input: () => input};
    
    const {output} = await runOrchestrationPrompt(input);
    return output!;
  }
);
