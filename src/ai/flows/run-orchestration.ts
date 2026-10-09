'use server';

/**
 * @fileOverview A flow for running an orchestration of a team of agents.
 *
 * - runOrchestration - A function that orchestrates a team of agents to produce a result.
 * - RunOrchestrationInput - The input type for the runOrchestration function.
 * - RunOrchestrationOutput - The return type for the runOrchestration function.
 */

import { ai } from '@/ai/genkit';
import { runAgent } from '@/ai/flows/run-agent-flow';
import { z } from 'genkit';
import { db } from '@/db';
import { clientProfiles, orchestrations, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

function cleanMarkdownResult(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // Strip wrapping markdown code blocks if the whole output is fenced in ```json or ```
  const codeBlockMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
  }

  // If text is a JSON object with a "result" field or similar
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.result === 'string') {
        return cleanMarkdownResult(parsed.result);
      }
      if (typeof parsed.response === 'string') {
        return cleanMarkdownResult(parsed.response);
      }
      if (typeof parsed.content === 'string') {
        return cleanMarkdownResult(parsed.content);
      }
    }
  } catch {
    // Not raw JSON string, return text as is
  }

  return text;
}

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
  clientProfileId: z.string().optional().describe('Optional client brand profile ID to inject context from.'),
  userId: z.string().optional().describe('User / Tenant ID.'),
});
export type RunOrchestrationInput = z.infer<typeof RunOrchestrationInputSchema>;

const RunOrchestrationOutputSchema = z.object({
  result: z
    .string()
    .describe('The final result of the orchestration, formatted as Markdown.'),
  clientName: z.string().optional(),
});
export type RunOrchestrationOutput = z.infer<
  typeof RunOrchestrationOutputSchema
>;

export async function runOrchestration(
  input: RunOrchestrationInput
): Promise<RunOrchestrationOutput> {
  const userId = input.userId || 'user-agency-demo';
  
  // 1. Fetch Client Profile if specified
  let clientProfile: any = null;
  if (input.clientProfileId) {
    try {
      clientProfile = db
        .select()
        .from(clientProfiles)
        .where(eq(clientProfiles.id, input.clientProfileId))
        .get();
    } catch (e) {
      console.warn('Could not fetch client profile:', e);
    }
  }

  // 2. Build Brand Context Prompt block
  let brandContextPrompt = '';
  if (clientProfile) {
    brandContextPrompt = `\n\n[CLIENT BRAND CONTEXT - STRICT ADHERENCE REQUIRED]
- Client / Brand Name: ${clientProfile.name}
${clientProfile.industry ? `- Industry: ${clientProfile.industry}` : ''}
${clientProfile.targetAudience ? `- Target Audience: ${clientProfile.targetAudience}` : ''}
${clientProfile.brandVoice ? `- Brand Voice & Tone: ${clientProfile.brandVoice}` : ''}
${clientProfile.contentGuidelines ? `- Content Guidelines & Rules: ${clientProfile.contentGuidelines}` : ''}
${clientProfile.keywords ? `- Target Keywords to include: ${clientProfile.keywords}` : ''}
${clientProfile.knowledgeContext ? `- Background Knowledge / Facts: ${clientProfile.knowledgeContext}` : ''}
All generated outputs must strictly align with this client's brand voice, target audience, and guidelines.\n`;
  }

  let contextSoFar = '';

  // 3. Execute each agent in sequence to contribute their expertise with client brand context
  for (const agent of input.agents) {
    const promptForAgent = contextSoFar
      ? `Overall Team Goal: ${input.task}${brandContextPrompt}\n\nPrevious Agent Work:\n${contextSoFar}\n\nNow, perform your specific part based on your role (${agent.role}) and objectives (${agent.objectives}). Produce your output in Markdown.`
      : `Overall Team Goal: ${input.task}${brandContextPrompt}\n\nPerform your specific part based on your role (${agent.role}) and objectives (${agent.objectives}). Produce your output in Markdown.`;

    const response = await runAgent({
      agent,
      task: promptForAgent,
    });

    const outputText = cleanMarkdownResult(response.result || 'Completed');
    contextSoFar += `### ${agent.name} (${agent.role})\n${outputText}\n\n`;
  }

  // 4. Synthesize the final comprehensive result from all agent contributions
  const synthesizePromptText = `You are a master orchestrator synthesizing the final output of an AI agent team.

Team: ${input.teamName}
Overall Task: ${input.task}
${brandContextPrompt ? `Client Brand Context:\n${brandContextPrompt}\n` : ''}
Here are the individual contributions from each agent in the team:
${contextSoFar}

Synthesize these agent contributions into a single, cohesive, high-quality, professional final deliverable.
Format your deliverable in clean, readable Markdown with clear headings, bullet points, and conclusions. Do NOT wrap in JSON. Return pure Markdown.`;

  let finalMarkdown = '';

  try {
    const synthResponse = await ai.generate({
      prompt: synthesizePromptText,
    });

    if (synthResponse.text) {
      finalMarkdown = cleanMarkdownResult(synthResponse.text);
    }
  } catch (synthErr) {
    console.warn('Direct synthesis fallback to compiled outputs:', synthErr);
  }

  if (!finalMarkdown) {
    // Fallback: return formatted compiled agent contributions
    finalMarkdown = cleanMarkdownResult(
      `# ${input.teamName}: Final Orchestration Report\n\n**Task:** ${input.task}${clientProfile ? `\n\n**Client Brand:** ${clientProfile.name}` : ''}\n\n---\n\n${contextSoFar}`
    );
  }

  // 5. Persist run to SQLite orchestrations table and update usage
  try {
    const orchestrationId = `orch-${Date.now()}`;
    db.insert(orchestrations)
      .values({
        id: orchestrationId,
        userId,
        clientProfileId: clientProfile?.id || null,
        clientName: clientProfile?.name || null,
        teamName: input.teamName,
        task: input.task,
        result: finalMarkdown,
        status: 'completed',
        modelUsed: process.env.CLOUDFLARE_DEFAULT_MODEL || '@cf/meta/llama-3.2-3b-instruct',
      })
      .run();

    // Increment usage quota
    const sub = db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
    if (sub) {
      db.update(subscriptions)
        .set({ currentUsage: (sub.currentUsage || 0) + 1, updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId))
        .run();
    }
  } catch (dbErr) {
    console.warn('Failed to record orchestration in DB:', dbErr);
  }

  return {
    result: finalMarkdown,
    clientName: clientProfile?.name,
  };
}
