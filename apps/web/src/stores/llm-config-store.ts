import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderType } from "@spotify-taste/llm-provider";
import { DEFAULT_MODELS } from "@spotify-taste/llm-provider";

interface LLMConfigState {
  provider: ProviderType;
  encryptedKey: string;
  model: string;
  endpoint: string;

  setProvider: (provider: ProviderType) => void;
  setEncryptedKey: (encryptedKey: string) => void;
  setModel: (model: string) => void;
  setEndpoint: (endpoint: string) => void;
  isConfigured: () => boolean;
}

export const useLLMConfigStore = create<LLMConfigState>()(
  persist(
    (set, get) => ({
      provider: "openai",
      encryptedKey: "",
      model: DEFAULT_MODELS.openai,
      endpoint: "",

      setProvider: (provider) =>
        set({ provider, model: DEFAULT_MODELS[provider], encryptedKey: "", endpoint: "" }),
      setEncryptedKey: (encryptedKey) => set({ encryptedKey }),
      setModel: (model) => set({ model }),
      setEndpoint: (endpoint) => set({ endpoint }),
      isConfigured: () => {
        const state = get();
        if (state.provider === "ollama") return !!state.endpoint;
        return !!state.encryptedKey;
      },
    }),
    { name: "llm-config" }
  )
);
