'use server';

/**
 * @fileOverview A flow for creating a technical support chatbot persona.
 *
 * - createSupportbot - A function that creates a chatbot persona based on a product/service description.
 * - CreateSupportbotInput - The input type for the createSupportbot function.
 * - CreateSupportbotOutput - The return type for the createSupportbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    welcomeMessage: z.string().describe("A welcome message that introduces the bot and gathers the initial user problem. It should not use a placeholder for the product name."),
    troubleshootingQuestions: z.array(z.string()).describe("A series of 3-5 questions to diagnose the user's issue (e.g., asking about error messages, what they've already tried)."),
    escalationMessage: z.string().describe("A message to use when the bot cannot solve the issue, explaining how to connect with a human support agent."),
    closingMessage: z.string().describe("A closing message to confirm if the issue was resolved and thank the user for their time.")
});

const CreateSupportbotOutputSchema = z.object({
  supportbotPersona: SupportBotPersonaSchema.describe("The detailed persona and script for the technical support chatbot."),
});
export type CreateSupportbotOutput = z.infer<typeof CreateSupportbotOutputSchema>;

export async function createSupportbot(input: CreateSupportbotInput): Promise<CreateSupportbotOutput> {
  return createSupportbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createSupportbotPrompt',
  input: {schema: CreateSupportbotInputSchema},
  output: {schema: CreateSupportbotOutputSchema},
  prompt: `You are an expert at creating technical support chatbots. Based on the product description and desired chatbot role provided by the user, you will generate a complete chatbot persona.

This persona should include:
1.  An appropriate and trustworthy name for the support bot.
2.  A welcome message that introduces the bot and immediately tries to understand the user's problem. **Important**: Do not use a placeholder for the product/company name (e.g., "[Product Name]"). The message should be generic enough to apply to any product.
3.  A series of 3-5 targeted troubleshooting questions to diagnose the issue. These should be logical and follow a standard support flow.
4.  An escalation message for when the bot can't help, clearly explaining the next step to talk to a human.
5.  A closing message for when a user's issue is resolved.

Product/Service Description: {{{productDescription}}}
Chatbot Role/Tone: {{{chatbotRole}}}

Generate the full support bot persona based on this information.`,
});

const createSupportbotFlow = ai.defineFlow(
  {
    name: 'createSupportbotFlow',
    inputSchema: CreateSupportbotInputSchema,
    outputSchema: CreateSupportbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
