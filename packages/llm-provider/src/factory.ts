import type { LLMProvider, ProviderConfig } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { OllamaProvider } from "./providers/ollama";
import { withRetry } from "./retry";

export function createProvider(config: ProviderConfig): LLMProvider {
  let provider: LLMProvider;

  switch (config.type) {
    case "openai":
      provider = new OpenAIProvider(config.apiKey, config.model, config.endpoint);
      break;
    case "anthropic":
      provider = new AnthropicProvider(config.apiKey, config.model, config.endpoint);
      break;
    case "gemini":
      provider = new GeminiProvider(config.apiKey, config.model, config.endpoint);
      break;
    case "ollama":
      provider = new OllamaProvider(config.model, config.endpoint);
      break;
  }

  return withRetry(provider);
}
