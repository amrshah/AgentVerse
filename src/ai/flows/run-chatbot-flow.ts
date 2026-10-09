'use server';

import { generateText } from '@/ai/client';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
});

const RunChatbotInputSchema = z.object({
  persona: z.string().describe("A JSON string representing the chatbot's detailed persona."),
  history: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
});
export type RunChatbotInput = z.infer<typeof RunChatbotInputSchema>;

const RunChatbotOutputSchema = z.object({
  message: z.string().describe("The chatbot's response to the user's last message."),
});
export type RunChatbotOutput = z.infer<typeof RunChatbotOutputSchema>;

export async function runChatbot(
  input: RunChatbotInput
): Promise<RunChatbotOutput> {
  const historyText = input.history.map(h => `${h.role}: ${h.content}`).join('\n');
  const prompt = `You are a chatbot. You must strictly adhere to the persona and guidelines provided below. Your goal is to have a natural, helpful conversation with the user.

**Your Persona & Rules:**
${input.persona}

**Conversation History:**
${historyText}

Based on the persona and the conversation history, provide a response to the user's last message. Do not repeat your welcome message. Be conversational and helpful.`;

  const message = await generateText({ prompt });
  return { message };
}
