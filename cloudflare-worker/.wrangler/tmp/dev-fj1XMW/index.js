var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
var DEFAULT_MODEL = "@cf/meta/llama-3.1-70b-instruct";
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({ status: "ok", worker: "agentverse-ai-worker", defaultModel: DEFAULT_MODEL }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    if (url.pathname === "/v1/models" || url.pathname === "/models") {
      const models = [
        { id: "@cf/meta/llama-3.1-70b-instruct", object: "model", owned_by: "cloudflare" },
        { id: "@cf/meta/llama-3.2-3b-instruct", object: "model", owned_by: "cloudflare" },
        { id: "@cf/mistral/mistral-7b-instruct-v0.1", object: "model", owned_by: "cloudflare" }
      ];
      return new Response(
        JSON.stringify({ object: "list", data: models }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    if (url.pathname === "/v1/chat/completions" || url.pathname === "/chat/completions") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
      }
      try {
        const body = await request.json();
        const model = body.model || DEFAULT_MODEL;
        const messages = body.messages || [];
        const cfMessages = messages.map((m) => ({
          role: m.role || "user",
          content: typeof m.content === "string" ? m.content : JSON.stringify(m.content)
        }));
        const aiPayload = {
          messages: cfMessages,
          stream: false,
          max_tokens: body.max_tokens || 3e3,
          temperature: body.temperature ?? 0.7
        };
        if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
          aiPayload.tools = body.tools;
        }
        let aiResponse;
        try {
          aiResponse = await env.AI.run(model, aiPayload);
        } catch (runErr) {
          if (aiPayload.tools) {
            delete aiPayload.tools;
            aiResponse = await env.AI.run(model, aiPayload);
          } else {
            throw runErr;
          }
        }
        if (aiResponse?.tool_calls && Array.isArray(aiResponse.tool_calls) && aiResponse.tool_calls.length > 0) {
          const toolCalls = aiResponse.tool_calls.map((tc, i) => ({
            id: tc.id || `call_${Date.now()}_${i}`,
            type: "function",
            function: {
              name: tc.name || tc.function?.name,
              arguments: typeof (tc.arguments || tc.function?.arguments) === "string" ? tc.arguments || tc.function?.arguments : JSON.stringify(tc.arguments || tc.function?.arguments || {})
            }
          }));
          const responsePayload2 = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1e3),
            model,
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: null,
                  tool_calls: toolCalls
                },
                finish_reason: "tool_calls"
              }
            ],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          };
          return new Response(JSON.stringify(responsePayload2), {
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }
        let replyContent = aiResponse?.response || aiResponse?.text || (typeof aiResponse === "string" ? aiResponse : JSON.stringify(aiResponse));
        if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
          const trimmed = replyContent.trim();
          try {
            const parsed = JSON.parse(trimmed);
            const toolNames = body.tools.map((t) => t.function?.name || t.name);
            if (parsed.name && toolNames.includes(parsed.name)) {
              const toolCalls = [{
                id: `call_${Date.now()}`,
                type: "function",
                function: {
                  name: parsed.name,
                  arguments: typeof parsed.arguments === "string" ? parsed.arguments : JSON.stringify(parsed.arguments || parsed.input || {})
                }
              }];
              return new Response(JSON.stringify({
                id: `chatcmpl-${Date.now()}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1e3),
                model,
                choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: toolCalls }, finish_reason: "tool_calls" }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
              }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
            }
            if (parsed.agent || parsed.agentName) {
              const agentName = parsed.agent || parsed.agentName;
              const task = parsed.task || JSON.stringify(parsed.input || {});
              const toolCalls = [{
                id: `call_${Date.now()}`,
                type: "function",
                function: {
                  name: "runAgent",
                  arguments: JSON.stringify({ agentName, task })
                }
              }];
              return new Response(JSON.stringify({
                id: `chatcmpl-${Date.now()}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1e3),
                model,
                choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: toolCalls }, finish_reason: "tool_calls" }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
              }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
            }
          } catch {
          }
        }
        const isJsonExpected = body.response_format?.type === "json_object" || JSON.stringify(messages).includes("result") || JSON.stringify(messages).includes("JSON");
        if (isJsonExpected) {
          try {
            const parsed = JSON.parse(replyContent.trim());
            if (parsed && typeof parsed === "object" && !("result" in parsed)) {
              replyContent = JSON.stringify({
                result: typeof parsed === "string" ? parsed : parsed.content || parsed.message || JSON.stringify(parsed, null, 2)
              });
            }
          } catch {
            replyContent = JSON.stringify({
              result: replyContent
            });
          }
        }
        const responsePayload = {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1e3),
          model,
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: replyContent
              },
              finish_reason: "stop"
            }
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };
        return new Response(JSON.stringify(responsePayload), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("Error generating AI response:", err);
        return new Response(
          JSON.stringify({
            error: {
              message: err.message || "Error communicating with Cloudflare AI",
              type: "cf_ai_error"
            }
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }
    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  }
};

// C:/Users/ali/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/ali/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-DDYC0f/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/ali/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-DDYC0f/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
