"use client";

import { useState, useCallback } from "react";
import { useLLMConfigStore } from "@/stores/llm-config-store";
import { encryptString, decryptString } from "@/lib/crypto";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuth } from "@/providers/auth-provider";
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
    <main className="px-8 py-6">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-[28px] font-bold text-foreground">
        Settings
      </h1>

      <div className="flex max-w-[640px] flex-col gap-6">
        {/* LLM Provider Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {/* Card Header */}
          <div className="border-b border-border p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
              LLM Provider
            </h2>
            <p className="mt-1 text-sm text-muted">
              Configure your AI provider for music analysis features
            </p>
          </div>

          {/* Card Body */}
          <div className="flex flex-col gap-5 p-6">
            {/* Provider selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Provider</label>
              <select
                value={store.provider}
                onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
                className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground"
              >
                {(Object.keys(PROVIDER_LABELS) as ProviderType[]).map((p) => (
                  <option key={p} value={p}>
                    {PROVIDER_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key input (not for Ollama) */}
            {!isOllama && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={`Enter your ${PROVIDER_LABELS[store.provider]} API key`}
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted"
                />
              </div>
            )}

            {/* Validation status */}
            {testResult?.ok && (
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span className="text-[13px] text-green-500">API key validated successfully</span>
              </div>
            )}
            {testResult && !testResult.ok && (
              <span className="text-[13px] text-red-500">{testResult.message}</span>
            )}

            {/* Endpoint (required for Ollama) */}
            {isOllama && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
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
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted"
                />
              </div>
            )}

            {/* Model selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Model</label>
              <select
                value={store.model}
                onChange={(e) => store.setModel(e.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground"
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

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveAndTest}
                disabled={testing || (!isOllama && !apiKey)}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Test Connection
              </button>
              <button
                onClick={handleSaveAndTest}
                disabled={testing || (!isOllama && !apiKey)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {testing ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Spotify Account Card */}
        <SpotifyAccountCard />
      </div>
    </main>
  );
}

function SpotifyAccountCard() {
  const { data: user } = useCurrentUser();
  const { logout } = useAuth();
  const avatarUrl = user?.images?.[0]?.url;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="border-b border-border p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
          Spotify Account
        </h2>
        <p className="mt-1 text-sm text-muted">
          Manage your connected Spotify account
        </p>
      </div>
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.display_name ?? "Avatar"}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-background text-sm font-medium">
              {user?.display_name?.charAt(0) ?? "?"}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {user?.display_name ?? "Spotify User"}
            </p>
            <p className="font-[family-name:var(--font-accent)] text-[13px] text-muted">
              {user?.product ? `${user.product.charAt(0).toUpperCase() + user.product.slice(1)} · Connected` : "Connected"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/5"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
