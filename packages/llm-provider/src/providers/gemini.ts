import type { LLMProvider, LLMMessage, LLMOptions } from "../types";

const DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor(apiKey: string, model: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.endpoint = endpoint ?? DEFAULT_ENDPOINT;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const model = options?.model ?? this.model;
    const systemMsg = messages.find((m) => m.role === "system");
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    const contents = nonSystemMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens,
      },
    };

    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const response = await fetch(
      `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: options?.signal,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} — ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
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
