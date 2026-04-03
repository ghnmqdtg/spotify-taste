export type LLMRole = "system" | "user" | "assistant";

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface LLMProvider {
  readonly name: string;
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
  /** Validate the API key with a minimal test call */
  validate(): Promise<boolean>;
}

export type ProviderType = "openai" | "anthropic" | "gemini" | "ollama";

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  model: string;
  /** Custom endpoint URL (required for Ollama, optional for others) */
  endpoint?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  /** Cost per 1M input tokens in USD */
  inputCostPer1M: number;
  /** Cost per 1M output tokens in USD */
  outputCostPer1M: number;
}

export const PROVIDER_MODELS: Record<ProviderType, ModelInfo[]> = {
  openai: [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
    { id: "gpt-4o", name: "GPT-4o", inputCostPer1M: 2.5, outputCostPer1M: 10 },
  ],
  anthropic: [
    { id: "claude-haiku-4-5-20251001", name: "Claude 4.5 Haiku", inputCostPer1M: 0.8, outputCostPer1M: 4 },
    { id: "claude-sonnet-4-6-20250514", name: "Claude Sonnet 4.6", inputCostPer1M: 3, outputCostPer1M: 15 },
  ],
  gemini: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", inputCostPer1M: 0.1, outputCostPer1M: 0.4 },
    { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro", inputCostPer1M: 1.25, outputCostPer1M: 10 },
  ],
  ollama: [
    { id: "gemma3:4b", name: "Gemma 3 (4B)", inputCostPer1M: 0, outputCostPer1M: 0 },
    { id: "gemma3:1b", name: "Gemma 3 (1B)", inputCostPer1M: 0, outputCostPer1M: 0 },
    { id: "gemma4", name: "Gemma 4", inputCostPer1M: 0, outputCostPer1M: 0 },
    { id: "llama3.2", name: "Llama 3.2", inputCostPer1M: 0, outputCostPer1M: 0 },
    { id: "mistral", name: "Mistral", inputCostPer1M: 0, outputCostPer1M: 0 },
  ],
};

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
  gemini: "gemini-2.0-flash",
  ollama: "gemma3:4b",
};
