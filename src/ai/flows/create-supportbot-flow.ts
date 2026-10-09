'use server';

import { generateText } from '@/ai/client';
import { z } from 'zod';

const CreateSupportbotInputSchema = z.object({
  productDescription: z
    .string()
    .describe('A description of the product or service for which the support bot is being created.'),
  chatbotRole: z
    .string()
    .describe('The desired role or personality for the chatbot (e.g., Patient Guide, Efficient Expert).'),
});
export type CreateSupportbotInput = z.infer<typeof CreateSupportbotInputSchema>;

const SupportBotPersonaSchema = z.object({
  name: z.string().describe("An appropriate and trustworthy name for the support bot."),
  welcomeMessage: z.string().describe("A welcome message that introduces the bot and gathers the initial problem."),
  troubleshootingQuestions: z.array(z.string()).describe("Questions to diagnose the issue."),
  escalationMessage: z.string().describe("Message when the issue cannot be resolved."),
  closingMessage: z.string().describe("Closing message to confirm resolution.")
});
export type SupportBotPersona = z.infer<typeof SupportBotPersonaSchema>;

const CreateSupportbotOutputSchema = z.object({
  supportbotPersona: SupportBotPersonaSchema.describe("The detailed persona and script for the technical support chatbot."),
});
export type CreateSupportbotOutput = z.infer<typeof CreateSupportbotOutputSchema>;

export async function createSupportbot(input: CreateSupportbotInput): Promise<CreateSupportbotOutput> {
  const prompt = `You are an expert at creating technical support chatbots. Based on the product description and desired role provided by the user, generate a complete chatbot persona in JSON format.

Product/Service Description: ${input.productDescription}
Chatbot Role/Tone: ${input.chatbotRole}

Return ONLY a valid JSON object with the following schema:
{
  "name": "Bot Name",
  "welcomeMessage": "Welcome message (do NOT use placeholders like [Product Name])",
  "troubleshootingQuestions": ["Question 1", "Question 2", "Question 3"],
  "escalationMessage": "Escalation message to connect with a human agent",
  "closingMessage": "Closing confirmation message"
}`;

  const text = await generateText({ prompt, json: true });
  let parsed: any = null;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (e) {
    parsed = {
      name: `${input.chatbotRole} Support Bot`,
      welcomeMessage: `Hi there! I am your support assistant. What issue are you experiencing today?`,
      troubleshootingQuestions: [
        'When did you first notice this problem occurring?',
        'Are there any specific error codes or messages displayed?',
        'What troubleshooting steps have you already attempted?'
      ],
      escalationMessage: 'If this does not resolve the issue, I can connect you directly with a senior support engineer.',
      closingMessage: 'Glad we could help! Let us know if you need anything else.'
    };
  }

  return {
    supportbotPersona: {
      name: parsed.name || 'Support Assistant',
      welcomeMessage: parsed.welcomeMessage || 'Hello! How can I assist you today?',
      troubleshootingQuestions: Array.isArray(parsed.troubleshootingQuestions) ? parsed.troubleshootingQuestions : ['What issue are you facing?'],
      escalationMessage: parsed.escalationMessage || 'Let me connect you to a human representative.',
      closingMessage: parsed.closingMessage || 'Thank you for reaching out!',
    }
  };
}
