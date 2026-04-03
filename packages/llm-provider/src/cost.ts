import type { ProviderType, ModelInfo } from "./types";
import { PROVIDER_MODELS } from "./types";

/**
 * Approximate token count from a string.
 * Uses the ~4 chars per token heuristic (works reasonably for English text).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost for an LLM call given input text and expected output tokens.
 */
export function estimateCost(
  provider: ProviderType,
  model: string,
  inputText: string,
  expectedOutputTokens: number = 1000
): { inputTokens: number; outputTokens: number; costUsd: number } | null {
  const modelInfo = getModelInfo(provider, model);
  if (!modelInfo) return null;

  const inputTokens = estimateTokens(inputText);
  const costUsd =
    (inputTokens / 1_000_000) * modelInfo.inputCostPer1M +
    (expectedOutputTokens / 1_000_000) * modelInfo.outputCostPer1M;

  return {
    inputTokens,
    outputTokens: expectedOutputTokens,
    costUsd: Math.round(costUsd * 10000) / 10000, // 4 decimal places
  };
}

export function getModelInfo(
  provider: ProviderType,
  model: string
): ModelInfo | undefined {
  return PROVIDER_MODELS[provider]?.find((m) => m.id === model);
}

export function formatCost(usd: number): string {
  if (usd === 0) return "Free (local)";
  if (usd < 0.01) return `<$0.01`;
  return `~$${usd.toFixed(2)}`;
}
