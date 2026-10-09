'use server';

import { generateText } from '@/ai/client';
import { z } from 'zod';

const CreateChatbotInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('A description of the business and its services for which the chatbot is being created.'),
  chatbotRole: z
    .string()
    .describe('The desired role or personality for the chatbot (e.g., Friendly Assistant, Professional Consultant).'),
});
export type CreateChatbotInput = z.infer<typeof CreateChatbotInputSchema>;

const ChatbotPersonaSchema = z.object({
  name: z.string().describe("A friendly and appropriate name for the chatbot."),
  welcomeMessage: z.string().describe("A warm welcome message that introduces the bot's purpose and what it can help with."),
  qualifyingQuestions: z.array(z.string()).describe("A series of 3-5 questions to qualify the lead."),
  closingMessage: z.string().describe("A closing message to thank the user and explain next steps.")
});
export type ChatbotPersona = z.infer<typeof ChatbotPersonaSchema>;

const CreateChatbotOutputSchema = z.object({
  chatbotPersona: ChatbotPersonaSchema.describe("The detailed persona and script for the lead qualification chatbot."),
});
export type CreateChatbotOutput = z.infer<typeof CreateChatbotOutputSchema>;

export async function createChatbot(input: CreateChatbotInput): Promise<CreateChatbotOutput> {
  const prompt = `You are an expert at creating lead qualification chatbots. Based on the business description and desired chatbot role provided by the user, you will generate a complete chatbot persona in JSON format.

Business Description: ${input.businessDescription}
Chatbot Role/Tone: ${input.chatbotRole}

Return ONLY a valid JSON object with the following schema:
{
  "name": "Chatbot Name",
  "welcomeMessage": "Welcome message (do NOT use placeholders like [Company])",
  "qualifyingQuestions": ["Question 1", "Question 2", "Question 3"],
  "closingMessage": "Closing message"
}`;

  const text = await generateText({ prompt, json: true });
  let parsed: any = null;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (e) {
    parsed = {
      name: `${input.chatbotRole} Bot`,
      welcomeMessage: `Hello! I am your ${input.chatbotRole}. How can I assist your business today?`,
      qualifyingQuestions: [
        'What specific services or solutions are you looking for?',
        'What is your target timeline for this project?',
        'What is your estimated budget range?'
      ],
      closingMessage: 'Thank you for sharing the details! Our team will follow up with you shortly.'
    };
  }

  return {
    chatbotPersona: {
      name: parsed.name || 'Assistant',
      welcomeMessage: parsed.welcomeMessage || 'Hello! How can I help you today?',
      qualifyingQuestions: Array.isArray(parsed.qualifyingQuestions) ? parsed.qualifyingQuestions : ['How can we help?'],
      closingMessage: parsed.closingMessage || 'Thank you for reaching out!',
    }
  };
}
