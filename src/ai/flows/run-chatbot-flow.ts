'use server';

/**
 * @fileOverview A flow for running a generic chatbot conversation.
 *
 * - runChatbot - A function that continues a conversation based on a persona and history.
 * - RunChatbotInput - The input type for the runChatbot function.
 * - RunChatbotOutput - The return type for the runChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
});

const RunChatbotInputSchema = z.object({
  persona: z.string().describe("A JSON string representing the chatbot's detailed persona, including its name, role, and script guidelines."),
  history: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
});
export type RunChatbotInput = z.infer<typeof RunChatbotInputSchema>;

const RunChatbotOutputSchema = z.object({
  message: z
    .string()
    .describe("The chatbot's response to the user's last message."),
});
export type RunChatbotOutput = z.infer<typeof RunChatbotOutputSchema>;

export async function runChatbot(
  input: RunChatbotInput
): Promise<RunChatbotOutput> {
  return runChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runChatbotPrompt',
  input: {schema: RunChatbotInputSchema},
  output: {schema: RunChatbotOutputSchema},
  prompt: `You are a chatbot. You must strictly adhere to the persona and guidelines provided below. Your goal is to have a natural, helpful conversation with the user.

**Your Persona & Rules:**
{{{persona}}}

**Conversation History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the persona and the conversation history, provide a response to the user's last message. Do not repeat your welcome message. Be conversational and helpful.
`,
});

const runChatbotFlow = ai.defineFlow(
  {
    name: 'runChatbotFlow',
    inputSchema: RunChatbotInputSchema,
    outputSchema: RunChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
