"use client";

import { useState } from "react";
import { estimateCost, formatCost } from "@spotify-taste/llm-provider";
import { useLLMConfigStore } from "@/stores/llm-config-store";

interface InsightCardProps {
  title: string;
  children: React.ReactNode;
  narrative?: string;
  onGenerate?: () => Promise<void>;
  loading?: boolean;
  hasLLM?: boolean;
  estimatedInputTokens?: number;
}

export function InsightCard({
  title,
  children,
  narrative,
  onGenerate,
  loading,
  hasLLM,
  estimatedInputTokens,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showCostConfirm, setShowCostConfirm] = useState(false);
  const llmConfig = useLLMConfigStore();

  const cost =
    hasLLM && estimatedInputTokens
      ? estimateCost(llmConfig.provider, llmConfig.model, "x".repeat(estimatedInputTokens * 4), 300)
      : null;

  const handleGenerateClick = () => {
    if (hasLLM && cost && cost.costUsd > 0) {
      setShowCostConfirm(true);
    } else {
      onGenerate?.();
    }
  };

  const handleConfirm = () => {
    setShowCostConfirm(false);
    onGenerate?.();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {onGenerate && !narrative && (
          <button
            onClick={handleGenerateClick}
            disabled={loading}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        )}
      </div>

      {showCostConfirm && cost && (
        <div className="mb-3 rounded-md border border-border bg-background p-3">
          <p className="text-sm">
            Estimated cost: <strong>{formatCost(cost.costUsd)}</strong> ({cost.inputTokens.toLocaleString()} tokens)
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleConfirm}
              className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowCostConfirm(false)}
              className="rounded-md border border-border px-3 py-1 text-xs text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>{children}</div>

      {narrative && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent hover:underline"
          >
            {expanded ? "Hide analysis" : "Show AI analysis"}
          </button>
          {expanded && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{narrative}</p>
          )}
        </div>
      )}
    </div>
  );
}
