"use client";

import { useState, useCallback, useEffect } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";
import {
  createProvider,
  type ProviderConfig,
} from "@spotify-taste/llm-provider";
import { useLLMConfigStore } from "@/stores/llm-config-store";
import { decryptString } from "@/lib/crypto";
import { db } from "@/lib/db";
import {
  computeMonthlyGenreDistributions,
  generateGenreEvolutionNarrative,
  findHiddenGems,
  enhanceGemsWithLLM,
  detectListeningPatterns,
  type GenreEvolutionData,
  type HiddenGem,
  type ListeningPatterns,
} from "@/lib/analysis/insights";
import { assignTrackGenres } from "@/lib/enrichment/assign-genres";
import { InsightCard } from "./insight-card";

interface InsightsSectionProps {
  tracks: LikedTrack[];
}

export function InsightsSection({ tracks }: InsightsSectionProps) {
  const llmConfig = useLLMConfigStore();
  const hasLLM = llmConfig.isConfigured();

  const [evolution, setEvolution] = useState<GenreEvolutionData | null>(null);
  const [gems, setGems] = useState<HiddenGem[] | null>(null);
  const [patterns, setPatterns] = useState<ListeningPatterns | null>(null);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [loadingGems, setLoadingGems] = useState(false);
  const [loadingPatterns, setLoadingPatterns] = useState(false);

  const getProvider = useCallback(async () => {
    if (!hasLLM) return null;
    const apiKey = llmConfig.encryptedKey
      ? await decryptString(llmConfig.encryptedKey)
      : "";
    const config: ProviderConfig = {
      type: llmConfig.provider,
      apiKey,
      model: llmConfig.model,
      endpoint: llmConfig.endpoint || undefined,
    };
    return createProvider(config);
  }, [hasLLM, llmConfig]);

  const getTrackGenres = useCallback(async () => {
    const artistGenres = await db.artistGenres.toArray();
    const genreMappings = await db.genreMappings.toArray();
    const genreMap = new Map(genreMappings.map((m) => [m.microGenre, m.macroCategory]));
    return assignTrackGenres(tracks, artistGenres, genreMap);
  }, [tracks]);

  // Compute deterministic patterns on mount
  useEffect(() => {
    (async () => {
      const trackGenres = await getTrackGenres();
      const p = detectListeningPatterns(tracks, trackGenres);
      setPatterns(p);
    })();
  }, [tracks, getTrackGenres]);

  // Compute hidden gems on mount
  useEffect(() => {
    setGems(findHiddenGems(tracks));
  }, [tracks]);

  const handleGenerateEvolution = useCallback(async () => {
    setLoadingEvolution(true);
    try {
      const trackGenres = await getTrackGenres();
      const monthly = computeMonthlyGenreDistributions(tracks, trackGenres);

      let narrative: string | undefined;
      if (hasLLM) {
        const provider = await getProvider();
        if (provider) {
          narrative = await generateGenreEvolutionNarrative(monthly, provider);
        }
      }

      setEvolution({ monthlyGenres: monthly, narrative });
    } finally {
      setLoadingEvolution(false);
    }
  }, [tracks, hasLLM, getProvider, getTrackGenres]);

  const handleGenerateGems = useCallback(async () => {
    setLoadingGems(true);
    try {
      const baseGems = findHiddenGems(tracks);
      if (hasLLM) {
        const provider = await getProvider();
        if (provider) {
          const enhanced = await enhanceGemsWithLLM(baseGems, provider);
          setGems(enhanced);
          return;
        }
      }
      setGems(baseGems);
    } finally {
      setLoadingGems(false);
    }
  }, [tracks, hasLLM, getProvider]);

  const sufficientData = tracks.length >= 100;
  const monthSpan = new Set(tracks.map((t) => t.addedAt.substring(0, 7))).size;

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">Insights</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Genre Evolution */}
        <InsightCard
          title="Genre Evolution"
          narrative={evolution?.narrative}
          onGenerate={sufficientData && monthSpan >= 6 ? handleGenerateEvolution : undefined}
          loading={loadingEvolution}
          hasLLM={hasLLM}
          estimatedInputTokens={500}
        >
          {!sufficientData || monthSpan < 6 ? (
            <p className="text-sm text-muted">
              Need {"\u2265"}100 tracks over {"\u2265"}6 months for this insight.
            </p>
          ) : evolution ? (
            <div className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted">
              {evolution.monthlyGenres.slice(-12).map((m) => {
                const top = Object.entries(m.genres)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3);
                return (
                  <p key={m.month}>
                    <span className="font-mono">{m.month}</span>:{" "}
                    {top.map(([g, c]) => `${g} (${c})`).join(", ")}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">Click Generate to analyze your genre evolution.</p>
          )}
        </InsightCard>

        {/* Hidden Gems */}
        <InsightCard
          title="Hidden Gems"
          narrative={gems?.some((g) => g.description) ? gems.filter((g) => g.description).map((g) => `${g.name}: ${g.description}`).join("\n\n") : undefined}
          onGenerate={hasLLM ? handleGenerateGems : undefined}
          loading={loadingGems}
          hasLLM={hasLLM}
          estimatedInputTokens={200}
        >
          {gems && gems.length > 0 ? (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {gems.slice(0, 8).map((g) => (
                <li key={g.uri} className="text-muted">
                  <span className="font-medium text-foreground">{g.name}</span>{" "}
                  — {g.artistNames.join(", ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No hidden gems found.</p>
          )}
        </InsightCard>

        {/* Listening Patterns */}
        <InsightCard title="Binge Sessions">
          {patterns && patterns.binges.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {patterns.binges.slice(0, 5).map((b) => (
                <li key={b.date} className="text-muted">
                  <span className="font-mono text-foreground">{b.date}</span>:{" "}
                  {b.count} tracks — mostly {b.topGenre} ({b.topArtist})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No binge sessions detected (need {">"}10 tracks in a day).</p>
          )}
        </InsightCard>

        {/* Discovery Bursts */}
        <InsightCard title="Discovery Bursts">
          {patterns && patterns.discoveryBursts.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {patterns.discoveryBursts.slice(0, 5).map((d) => (
                <li key={d.weekStart} className="text-muted">
                  Week of <span className="font-mono text-foreground">{d.weekStart}</span>:{" "}
                  {d.newArtistCount} new artists discovered
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No discovery bursts detected (need {">"}5 new artists in a week).</p>
          )}
        </InsightCard>
      </div>
    </div>
  );
}
