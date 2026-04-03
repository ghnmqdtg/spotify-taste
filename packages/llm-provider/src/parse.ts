/**
 * 3-tier JSON parser with recovery for LLM responses.
 * Handles: raw JSON, markdown code blocks, and brace-delimited JSON.
 */
export function parseLLMJson<T>(raw: string): T {
  // Tier 1: direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // continue to tier 2
  }

  // Tier 2: extract from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue to tier 3
    }
  }

  // Tier 3: find outermost JSON structure
  const braceMatch = raw.match(/[\[{][\s\S]*[\]}]/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // fall through
    }
  }

  throw new Error("Failed to parse LLM response as JSON");
}
