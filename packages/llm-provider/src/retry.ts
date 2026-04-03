import type { LLMProvider, LLMMessage, LLMOptions } from "./types";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps an LLM provider with retry logic for transient failures.
 * Retries on rate limits (429-like errors) and timeouts with exponential backoff.
 */
export function withRetry(provider: LLMProvider): LLMProvider {
  return {
    name: provider.name,
    validate: () => provider.validate(),
    async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await provider.complete(messages, options);
        } catch (error) {
          lastError = error as Error;
          const message = lastError.message;

          // Don't retry auth errors or abort
          if (message.includes("401") || message.includes("403")) throw lastError;
          if (options?.signal?.aborted) throw lastError;

          // Retry on rate limit or server errors
          const isRetryable =
            message.includes("429") ||
            message.includes("500") ||
            message.includes("502") ||
            message.includes("503") ||
            message.includes("timeout");

          if (!isRetryable || attempt === MAX_RETRIES) throw lastError;

          await sleep(INITIAL_DELAY_MS * Math.pow(2, attempt));
        }
      }

      throw lastError!;
    },
  };
}
