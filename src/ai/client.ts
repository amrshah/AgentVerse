export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type GenerateOptions = {
  prompt?: string;
  system?: string;
  messages?: Message[];
  model?: string;
  temperature?: number;
  json?: boolean;
};

export async function generateText(options: GenerateOptions): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'be941241fb3499e9567c7ec28528c984';
  const apiToken = process.env.CF_AI_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || process.env.CF_WORKER_API_KEY || '';
  const model = options.model || process.env.CF_MODEL || '@cf/meta/llama-3.2-3b-instruct';

  const messages: Message[] = [];
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  if (options.messages && options.messages.length > 0) {
    messages.push(...options.messages);
  } else if (options.prompt) {
    messages.push({ role: 'user', content: options.prompt });
  }

  const endpoint = process.env.CF_WORKER_URL
    ? (process.env.CF_WORKER_URL.endsWith('/chat/completions')
        ? process.env.CF_WORKER_URL
        : `${process.env.CF_WORKER_URL.replace(/\/+$/, '')}/chat/completions`)
    : `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;

  const payload: any = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
  };

  if (options.json) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Cloudflare Workers AI Error:', res.status, errorText);
    throw new Error(`Cloudflare Workers AI request failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const reply = choice?.message?.content || choice?.text || '';
  return reply.trim();
}

/**
 * Lightweight, zero-dependency AI engine compatible with standard Cloudflare Edge & Workers.
 */
export const ai = {
  async generate({ prompt, system, messages, model }: { prompt?: string; system?: string; messages?: any[]; model?: string }) {
    const text = await generateText({ prompt, system, messages, model });
    return { text };
  },
};
