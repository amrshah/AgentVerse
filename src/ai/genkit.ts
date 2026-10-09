import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAICompatible } from '@genkit-ai/compat-oai';

const provider = (process.env.AI_PROVIDER || 'google').toLowerCase();

function initializeAI() {
  const plugins: any[] = [];
  let defaultModel = '';

  if (provider === 'cloudflare' || process.env.CF_WORKER_URL || process.env.CLOUDFLARE_ACCOUNT_ID) {
    const baseURL = process.env.CF_WORKER_URL 
      ? (process.env.CF_WORKER_URL.endsWith('/v1') ? process.env.CF_WORKER_URL : `${process.env.CF_WORKER_URL}/v1`)
      : `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`;

    const apiKey = process.env.CF_WORKER_API_KEY || process.env.CLOUDFLARE_API_TOKEN || 'cf-worker';
    const model = process.env.CF_MODEL || '@cf/meta/llama-3.2-3b-instruct';

    plugins.push(
      openAICompatible({
        name: 'cloudflare',
        apiKey: apiKey,
        baseURL: baseURL,
      })
    );
    defaultModel = `cloudflare/${model}`;
  } else if (provider === 'groq' || (provider === 'auto' && process.env.GROQ_API_KEY)) {
    plugins.push(
      openAICompatible({
        name: 'groq',
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      })
    );
    defaultModel = `groq/${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`;
  } else if (provider === 'openrouter' || (provider === 'auto' && process.env.OPENROUTER_API_KEY)) {
    plugins.push(
      openAICompatible({
        name: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
      })
    );
    defaultModel = `openrouter/${process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct'}`;
  } else if (provider === 'sambanova' || (provider === 'auto' && process.env.SAMBANOVA_API_KEY)) {
    plugins.push(
      openAICompatible({
        name: 'sambanova',
        apiKey: process.env.SAMBANOVA_API_KEY,
        baseURL: 'https://api.sambanova.ai/v1',
      })
    );
    defaultModel = `sambanova/${process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct'}`;
  } else {
    // Default to Google GenAI
    plugins.push(googleAI());
    const rawModel = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
    defaultModel = rawModel.startsWith('googleai/') ? rawModel : `googleai/${rawModel}`;
  }

  return genkit({
    plugins,
    model: defaultModel,
  });
}

export const ai = initializeAI();
