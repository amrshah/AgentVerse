'use server';

/**
 * @fileOverview A flow for creating a lead qualification chatbot persona.
 *
 * - createChatbot - A function that creates a chatbot persona based on a business description.
 * - CreateChatbotInput - The input type for the createChatbot function.
 * - CreateChatbotOutput - The return type for the createChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    welcomeMessage: z.string().describe("A warm welcome message that introduces the bot and the business."),
    qualifyingQuestions: z.array(z.string()).describe("A series of 3-5 questions to qualify the lead (e.g., asking about budget, timeline, needs)."),
    closingMessage: z.string().describe("A closing message to thank the user and explain the next steps (e.g., 'Thanks! A specialist will contact you shortly.').")
});

const CreateChatbotOutputSchema = z.object({
  chatbotPersona: ChatbotPersonaSchema.describe("The detailed persona and script for the lead qualification chatbot."),
});
export type CreateChatbotOutput = z.infer<typeof CreateChatbotOutputSchema>;

export async function createChatbot(input: CreateChatbotInput): Promise<CreateChatbotOutput> {
  return createChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createChatbotPrompt',
  input: {schema: CreateChatbotInputSchema},
  output: {schema: CreateChatbotOutputSchema},
  prompt: `You are an expert at creating lead qualification chatbots. Based on the business description and desired chatbot role provided by the user, you will generate a complete chatbot persona.

This persona should include:
1.  A friendly and appropriate name for the chatbot that fits its role.
2.  A warm welcome message that introduces the bot and what it does, matching the specified tone.
3.  A series of 3-5 targeted questions to effectively qualify the lead. These questions should be relevant to the business services.
4.  A closing message that thanks the user and clearly states the next steps.

Business Description: {{{businessDescription}}}
Chatbot Role/Tone: {{{chatbotRole}}}

Generate the full chatbot persona based on this information.`,
});

const createChatbotFlow = ai.defineFlow(
  {
    name: 'createChatbotFlow',
    inputSchema: CreateChatbotInputSchema,
    outputSchema: CreateChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
