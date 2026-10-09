'use server';

import { generateText } from '@/ai/client';
import { z } from 'zod';

const CreateSamContentInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for the blog post.'),
});
export type CreateSamContentInput = z.infer<typeof CreateSamContentInputSchema>;

const CreateSamContentOutputSchema = z.object({
  blogPost: z
    .string()
    .describe('The full blog post content, formatted in Markdown, adhering to all SAM guidelines.'),
});
export type CreateSamContentOutput = z.infer<typeof CreateSamContentOutputSchema>;

export async function createSamContent(input: CreateSamContentInput): Promise<CreateSamContentOutput> {
  const prompt = `You are the "Silver Scribe," an AI agent that writes authoritative content for a digital marketing agency.
Your task is to write a comprehensive, high-quality, professional piece of content on the following topic.

Topic: ${input.topic}

Follow these principles:
1. Executive Hook & Context: A strong, insight-led opening framing the problem or opportunity.
2. Core Strategic Analysis: Break down the subject with clean Markdown headers and actionable takeaways.
3. Tone: Direct, practically grounded, consultant-grade, polished simplicity.
4. Output: Return pure, well-structured Markdown. Do NOT wrap in JSON.`;

  const blogPost = await generateText({ prompt });
  return { blogPost };
}
