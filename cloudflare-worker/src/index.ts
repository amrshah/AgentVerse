export interface Env {
  AI: any;
  AUTH_SECRET?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DEFAULT_MODEL = '@cf/meta/llama-3.2-3b-instruct';

function extractAgentCallArgs(rawArgs: any, text: string, allMessagesText: string): any {
  let args: any = {};
  if (typeof rawArgs === 'string') {
    try {
      args = JSON.parse(rawArgs);
    } catch {
      args = {};
    }
  } else if (rawArgs && typeof rawArgs === 'object') {
    args = { ...rawArgs };
  }

  // Normalize { agent: '...' } to { agentName: '...' }
  if (args.agent && !args.agentName) {
    args.agentName = args.agent;
  }

  // If already has both agentName and task, return it
  if (args.agentName && args.task) {
    return args;
  }

  // Try extracting from text
  const combinedText = (text || '') + '\n' + (allMessagesText || '');
  if (!args.agentName) {
    const jsonMatch = (text || '').match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.agentName || parsed.agent) {
          args.agentName = parsed.agentName || parsed.agent;
        }
        if (parsed.task) {
          args.task = parsed.task;
        }
      } catch {}
    }
  }

  if (!args.agentName) {
    const agentMatch = (text || '').match(/(?:agent|agentName|agent_name)["']?\s*[:=]\s*["']([^"'\n\r]+)/i);
    if (agentMatch) {
      args.agentName = agentMatch[1].trim();
    }
  }

  // Find agent names mentioned in prompt
  if (!args.agentName) {
    const teamAgents = [...combinedText.matchAll(/-\s+([A-Za-z0-9\s_-]+)\s*\(/g)].map(m => m[1].trim());
    for (const agent of teamAgents) {
      if ((text || '').includes(agent)) {
        args.agentName = agent;
        break;
      }
    }
  }

  if (!args.task) {
    const taskMatch = (text || '').match(/(?:task|instructions?|action)["']?\s*[:=]\s*["']([^"'\n\r]+)/i);
    if (taskMatch) {
      args.task = taskMatch[1].trim();
    } else {
      args.task = (text || '').replace(/\{[\s\S]*?\}/, '').trim() || 'Execute assigned role task';
    }
  }

  return args;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', worker: 'agentverse-ai-worker', defaultModel: DEFAULT_MODEL }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // List models
    if (url.pathname === '/v1/models' || url.pathname === '/models') {
      const models = [
        { id: '@cf/meta/llama-3.1-70b-instruct', object: 'model', owned_by: 'cloudflare' },
        { id: '@cf/meta/llama-3.2-3b-instruct', object: 'model', owned_by: 'cloudflare' },
        { id: '@cf/mistral/mistral-7b-instruct-v0.1', object: 'model', owned_by: 'cloudflare' },
      ];
      return new Response(
        JSON.stringify({ object: 'list', data: models }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // OpenAI compatible chat completions
    if (url.pathname === '/v1/chat/completions' || url.pathname === '/chat/completions') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
      }

      try {
        const body: any = await request.json();
        const model = body.model || DEFAULT_MODEL;
        const messages = body.messages || [];

        const allMessagesText = messages.map((m: any) => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join('\n');

        // Prepare and normalize messages for Cloudflare AI schema
        const cfMessages = messages.map((m: any) => {
          let role = m.role || 'user';
          if (role === 'tool' || role === 'function') {
            role = 'user';
          }

          let content = '';
          if (typeof m.content === 'string') {
            content = m.content;
          } else if (Array.isArray(m.content)) {
            content = m.content
              .map((part: any) => {
                if (typeof part === 'string') return part;
                if (part && typeof part === 'object') {
                  return part.text || part.content || JSON.stringify(part);
                }
                return String(part);
              })
              .join('\n');
          } else if (m.content && typeof m.content === 'object') {
            content = JSON.stringify(m.content);
          } else if (m.tool_calls && Array.isArray(m.tool_calls)) {
            content = `[Tool Call Request]: ${JSON.stringify(m.tool_calls)}`;
          } else {
            content = '';
          }

          if (m.role === 'tool' || m.role === 'function' || m.name) {
            content = `[Tool Result for ${m.name || m.tool_call_id || 'function'}]: ${content}`;
          }

          return {
            role: role === 'assistant' ? 'assistant' : role === 'system' ? 'system' : 'user',
            content: content.trim() || ' ',
          };
        });

        const aiPayload: any = {
          messages: cfMessages,
          stream: false,
          max_tokens: body.max_tokens || 3000,
          temperature: body.temperature ?? 0.7,
        };

        if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
          aiPayload.tools = body.tools;
        }

        // Call Cloudflare Workers AI
        let aiResponse: any;
        try {
          aiResponse = await env.AI.run(model, aiPayload);
        } catch (runErr: any) {
          if (aiPayload.tools) {
            delete aiPayload.tools;
            aiResponse = await env.AI.run(model, aiPayload);
          } else {
            throw runErr;
          }
        }

        const replyText = aiResponse?.response || aiResponse?.text || (typeof aiResponse === 'string' ? aiResponse : '');

        // Check if Cloudflare AI returned native tool_calls
        if (aiResponse?.tool_calls && Array.isArray(aiResponse.tool_calls) && aiResponse.tool_calls.length > 0) {
          const defaultToolName = body.tools?.[0]?.function?.name || body.tools?.[0]?.name || 'runAgent';
          const validToolCalls: any[] = [];

          for (let i = 0; i < aiResponse.tool_calls.length; i++) {
            const tc = aiResponse.tool_calls[i];
            const name = tc.name || tc.function?.name || tc.tool || defaultToolName;
            const extractedArgs = extractAgentCallArgs(tc.arguments || tc.function?.arguments || tc.input, replyText, allMessagesText);

            if (extractedArgs.agentName && extractedArgs.task) {
              validToolCalls.push({
                id: tc.id || `call_${Date.now()}_${i}`,
                type: 'function',
                function: {
                  name: name,
                  arguments: JSON.stringify(extractedArgs),
                },
              });
            }
          }

          if (validToolCalls.length > 0) {
            const responsePayload = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: model,
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: null,
                    tool_calls: validToolCalls,
                  },
                  finish_reason: 'tool_calls',
                },
              ],
              usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            };

            return new Response(JSON.stringify(responsePayload), {
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }
        }

        let replyContent = replyText || JSON.stringify(aiResponse);

        // Check if the model emitted a tool call in text
        if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
          const defaultToolName = body.tools?.[0]?.function?.name || body.tools?.[0]?.name || 'runAgent';
          const extractedArgs = extractAgentCallArgs({}, replyContent, allMessagesText);

          if (extractedArgs.agentName && extractedArgs.task && !replyContent.toLowerCase().includes('# final') && !replyContent.toLowerCase().includes('## final result')) {
            const toolCalls = [{
              id: `call_${Date.now()}`,
              type: 'function',
              function: {
                name: defaultToolName,
                arguments: JSON.stringify(extractedArgs),
              },
            }];

            return new Response(JSON.stringify({
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: model,
              choices: [{ index: 0, message: { role: 'assistant', content: null, tool_calls: toolCalls }, finish_reason: 'tool_calls' }],
              usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
          }
        }

        // Schema / JSON response handling: ensure required schema property 'result' is satisfied
        const isJsonExpected = body.response_format?.type === 'json_object' || 
          allMessagesText.includes('"result"') || 
          allMessagesText.includes('JSON schema');

        if (isJsonExpected) {
          try {
            const parsed = JSON.parse(replyContent.trim());
            if (parsed && typeof parsed === 'object' && !('result' in parsed)) {
              replyContent = JSON.stringify({
                result: typeof parsed === 'string' ? parsed : (parsed.content || parsed.message || JSON.stringify(parsed, null, 2)),
              });
            }
          } catch {
            replyContent = JSON.stringify({
              result: replyContent,
            });
          }
        }

        const responsePayload = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: replyContent,
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        };

        return new Response(JSON.stringify(responsePayload), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('Error generating AI response:', err);
        return new Response(
          JSON.stringify({
            error: {
              message: err.message || 'Error communicating with Cloudflare AI',
              type: 'cf_ai_error',
            },
          }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  },
};
