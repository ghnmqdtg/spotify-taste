import type { LLMProvider, LLMMessage, LLMOptions } from "../types";

const DEFAULT_ENDPOINT = "https://api.anthropic.com";

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor(apiKey: string, model: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.endpoint = endpoint ?? DEFAULT_ENDPOINT;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    // Anthropic expects system message separately
    const systemMsg = messages.find((m) => m.role === "system");
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: options?.model ?? this.model,
      messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
    };

    if (systemMsg) {
      body.system = systemMsg.content;
    }

    const response = await fetch(`${this.endpoint}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} — ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
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
