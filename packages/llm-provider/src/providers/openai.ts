import type { LLMProvider, LLMMessage, LLMOptions } from "../types";

const DEFAULT_ENDPOINT = "https://api.openai.com/v1";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor(apiKey: string, model: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.endpoint = endpoint ?? DEFAULT_ENDPOINT;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const response = await fetch(`${this.endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} — ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async validate(): Promise<boolean> {
    try {
      await this.complete(
        [{ role: "user", content: "hi" }],
        { maxTokens: 1 }
      );
      return true;
    } catch {
      return false;
    }
  }
}
