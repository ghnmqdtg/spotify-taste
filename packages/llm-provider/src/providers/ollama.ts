import type { LLMProvider, LLMMessage, LLMOptions } from "../types";

const DEFAULT_ENDPOINT = "http://localhost:11434";

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";
  private model: string;
  private endpoint: string;

  constructor(model: string, endpoint?: string) {
    this.model = model;
    this.endpoint = endpoint ?? DEFAULT_ENDPOINT;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const response = await fetch(`${this.endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens,
        },
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} — ${error}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  async validate(): Promise<boolean> {
    try {
      // Just check if Ollama is running by listing models
      const response = await fetch(`${this.endpoint}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
