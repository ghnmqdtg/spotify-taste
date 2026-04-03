"use client";

import { useState, useCallback } from "react";
import { useLLMConfigStore } from "@/stores/llm-config-store";
import { encryptString, decryptString } from "@/lib/crypto";
import {
  createProvider,
  PROVIDER_MODELS,
  DEFAULT_MODELS,
  type ProviderType,
  type ProviderConfig,
} from "@spotify-taste/llm-provider";

const PROVIDER_LABELS: Record<ProviderType, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
  ollama: "Ollama (Local)",
};

export default function SettingsPage() {
  const store = useLLMConfigStore();
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState(store.endpoint);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [keyLoaded, setKeyLoaded] = useState(false);

  // Decrypt existing key for display
  const loadExistingKey = useCallback(async () => {
    if (store.encryptedKey && !keyLoaded) {
      try {
        const decrypted = await decryptString(store.encryptedKey);
        setApiKey(decrypted);
        setKeyLoaded(true);
      } catch {
        // Key can't be decrypted (different browser/device)
        setApiKey("");
      }
    }
  }, [store.encryptedKey, keyLoaded]);

  // Load key on first render if exists
  if (store.encryptedKey && !keyLoaded) {
    loadExistingKey();
  }

  const handleProviderChange = (provider: ProviderType) => {
    store.setProvider(provider);
    setApiKey("");
    setEndpoint("");
    setTestResult(null);
    setKeyLoaded(false);
  };

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Encrypt and save the key
      let encryptedKey = "";
      if (apiKey && store.provider !== "ollama") {
        encryptedKey = await encryptString(apiKey);
      }
      store.setEncryptedKey(encryptedKey);
      store.setEndpoint(endpoint);

      // Build provider config and test
      const config: ProviderConfig = {
        type: store.provider,
        apiKey,
        model: store.model,
        endpoint: endpoint || undefined,
      };

      const provider = createProvider(config);
      const ok = await provider.validate();

      setTestResult(
        ok
          ? { ok: true, message: "Connection successful!" }
          : { ok: false, message: "Validation failed. Check your key and try again." }
      );
    } catch (err) {
      setTestResult({
        ok: false,
        message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const models = PROVIDER_MODELS[store.provider];
  const isOllama = store.provider === "ollama";

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">LLM Settings</h1>

      <div className="space-y-6 rounded-lg border border-border bg-card p-6">
        {/* Provider selector */}
        <div>
          <label className="mb-2 block text-sm font-medium">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROVIDER_LABELS) as ProviderType[]).map((p) => (
              <button
                key={p}
                onClick={() => handleProviderChange(p)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  store.provider === p
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* API Key input (not for Ollama) */}
        {!isOllama && (
          <div>
            <label className="mb-2 block text-sm font-medium">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder={`Enter your ${PROVIDER_LABELS[store.provider]} API key`}
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted">
              Your key is encrypted and stored locally. It never leaves your browser.
            </p>
          </div>
        )}

        {/* Endpoint (required for Ollama, optional for others) */}
        {isOllama && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Endpoint URL
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => {
                setEndpoint(e.target.value);
                setTestResult(null);
              }}
              placeholder="http://localhost:11434"
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
            />
          </div>
        )}

        {/* Model selector */}
        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <select
            value={store.model}
            onChange={(e) => store.setModel(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.inputCostPer1M > 0
                  ? ` ($${m.inputCostPer1M}/$${m.outputCostPer1M} per 1M tokens)`
                  : " (Free)"}
              </option>
            ))}
          </select>
        </div>

        {/* Test button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveAndTest}
            disabled={testing || (!isOllama && !apiKey)}
            className="rounded-md bg-accent px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {testing ? "Testing..." : "Save & Test Connection"}
          </button>
          {testResult && (
            <span
              className={`text-sm ${testResult.ok ? "text-green-500" : "text-red-500"}`}
            >
              {testResult.message}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
