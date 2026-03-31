import { networking, prepare } from "@absolutejs/absolute";
import { streamAI, createConversationManager } from "@absolutejs/absolute/ai";
import { anthropic } from "@absolutejs/absolute/ai/anthropic";
import { openai } from "@absolutejs/absolute/ai/openai";
import { ollama } from "@absolutejs/absolute/ai/ollama";
import { Elysia } from "elysia";
import { pagesPlugin } from "./plugins/pagesPlugin";
import { parseAIMessage } from "@absolutejs/absolute/ai";

const { absolutejs, manifest } = await prepare();

const conversations = createConversationManager();

const PROVIDERS = {
  anthropic: anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" }),
  ollama: ollama(),
  openai: openai({ apiKey: process.env.OPENAI_API_KEY ?? "" }),
};

const WEATHER_DATA: Record<string, string> = {
  london: "London: 12C, cloudy with light rain",
  nyc: "New York: 24C, sunny and clear",
  paris: "Paris: 18C, partly cloudy",
  tokyo: "Tokyo: 28C, humid with scattered showers",
};

const lookupWeather = (input: unknown) => {
  const city =
    typeof input === "object" && input !== null && "city" in input
      ? String((input as Record<string, unknown>).city)
      : "unknown";

  return WEATHER_DATA[city.toLowerCase()] ?? `No weather data for ${city}`;
};

const tools = {
  get_weather: {
    description: "Get the current weather for a city",
    handler: lookupWeather,
    input: {
      properties: { city: { description: "City name", type: "string" } },
      required: ["city"],
      type: "object",
    },
  },
};

const resolveProvider = (providerName: string) => {
  if (providerName in PROVIDERS) {
    return PROVIDERS[providerName as keyof typeof PROVIDERS];
  }

  return PROVIDERS.anthropic;
};

const server = new Elysia()
  .use(absolutejs)
  .use(pagesPlugin(manifest))
  .ws("/chat", {
    message: async (ws, raw) => {
      const msg = parseAIMessage(raw);

      if (!msg) {
        return;
      }

      if (msg.type === "cancel" && msg.conversationId) {
        conversations.abort(msg.conversationId);

        return;
      }

      if (msg.type === "branch") {
        const newConvId = conversations.branch(
          msg.messageId,
          msg.conversationId,
        );

        if (newConvId) {
          ws.send(
            JSON.stringify({ conversationId: newConvId, type: "branched" }),
          );
        }

        return;
      }

      if (msg.type !== "message") {
        return;
      }

      const conversationId =
        msg.conversationId ?? crypto.randomUUID();
      const messageId = crypto.randomUUID();
      const conversation = conversations.getOrCreate(conversationId);
      const history = conversations.getHistory(conversationId);
      const controller = conversations.getAbortController(conversationId);

      // Extract provider from content prefix: "anthropic:hello" or just "hello"
      const colonIdx = msg.content.indexOf(":");
      const hasProvider = colonIdx > 0 && colonIdx < 12;
      const providerName = hasProvider
        ? msg.content.slice(0, colonIdx)
        : "anthropic";
      const content = hasProvider
        ? msg.content.slice(colonIdx + 1)
        : msg.content;

      conversations.appendMessage(conversationId, {
        content,
        conversationId,
        id: messageId,
        role: "user",
        timestamp: Date.now(),
      });

      await streamAI(ws, conversationId, messageId, {
        maxTurns: 5,
        messages: [...history, { content, role: "user" }],
        model:
          providerName === "openai"
            ? "gpt-4o-mini"
            : providerName === "ollama"
              ? "llama3.2"
              : "claude-sonnet-4-5-20250514",
        onComplete: (fullResponse) => {
          conversations.appendMessage(conversationId, {
            content: fullResponse,
            conversationId,
            id: crypto.randomUUID(),
            role: "assistant",
            timestamp: Date.now(),
          });
        },
        provider: resolveProvider(providerName),
        signal: controller.signal,
        systemPrompt:
          "You are a helpful assistant. You have access to a weather tool. Keep responses concise.",
        tools,
      });
    },
  })
  .use(networking)
  .on("error", (error) => {
    const { request } = error;
    console.error(
      `Server error on ${request.method} ${request.url}: ${error.message}`,
    );
  });

export type Server = typeof server;
