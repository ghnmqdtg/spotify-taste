"use client";

import { useState, useEffect, useCallback } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";
import {
  createProvider,
  estimateCost,
  formatCost,
  type ProviderConfig,
} from "@spotify-taste/llm-provider";
import { useLLMConfigStore } from "@/stores/llm-config-store";
import { decryptString } from "@/lib/crypto";
import { db, type TasteProfile } from "@/lib/db";
import { computeTasteStats } from "@/lib/analysis/taste-stats";
import {
  generateTasteProfile,
  getCachedProfile,
  isProfileStale,
} from "@/lib/analysis/taste-profile";
import { fetchArtistGenres } from "@/lib/enrichment/fetch-genres";
import { normalizeGenres } from "@/lib/enrichment/normalize-genres";
import { assignTrackGenres } from "@/lib/enrichment/assign-genres";
import { GenreRadarChart } from "./genre-radar-chart";
import { ArchetypeCard } from "./archetype-card";
import {
  EnrichmentProgress,
  type EnrichmentProgressProps,
} from "./enrichment-progress";

interface TasteProfileSectionProps {
  tracks: LikedTrack[];
}

export function TasteProfileSection({ tracks }: TasteProfileSectionProps) {
  const llmConfig = useLLMConfigStore();
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<EnrichmentProgressProps>({
    phase: "idle",
  });
  const [error, setError] = useState<string | null>(null);

  // Load cached profile
  useEffect(() => {
    getCachedProfile().then((cached) => {
      if (cached) {
        setProfile(cached);
        setStale(isProfileStale(cached, tracks.length));
      }
    });
  }, [tracks.length]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEnrichProgress({ phase: "idle" });

    try {
      // Step 1: Fetch artist genres
      setEnrichProgress({ phase: "fetching", completed: 0, total: 0 });
      const artistGenreRecords = await fetchArtistGenres((p) => {
        setEnrichProgress({ phase: "fetching", completed: p.completed, total: p.total });
      });

      // Build artist genre map for quick lookup
      const artistGenreMap = new Map(
        artistGenreRecords.map((r) => [r.artistId, r.genres])
      );
      const allMicroGenres = [...new Set(artistGenreRecords.flatMap((r) => r.genres))];

      let genreMapping: Map<string, string>;
      const hasKey = llmConfig.isConfigured();

      if (hasKey) {
        const apiKey = llmConfig.encryptedKey
          ? await decryptString(llmConfig.encryptedKey)
          : "";
        const config: ProviderConfig = {
          type: llmConfig.provider,
          apiKey,
          model: llmConfig.model,
          endpoint: llmConfig.endpoint || undefined,
        };
        const provider = createProvider(config);

        // Step 2: Normalize genres with LLM (skip if no genres found)
        if (allMicroGenres.length > 0) {
          setEnrichProgress({ phase: "normalizing" });
          genreMapping = await normalizeGenres(allMicroGenres, provider);
        } else {
          genreMapping = new Map();
        }

        // Step 3: Assign genres to tracks
        const trackGenres = assignTrackGenres(tracks, artistGenreRecords, genreMapping);

        // Step 4: Compute stats and generate profile
        const stats = computeTasteStats(tracks, trackGenres);
        const newProfile = await generateTasteProfile(stats, provider);
        setProfile(newProfile);
        setStale(false);
      } else {
        // No LLM — just compute deterministic stats with raw genres
        genreMapping = new Map(allMicroGenres.map((g) => [g, g]));
        const trackGenres = assignTrackGenres(tracks, artistGenreRecords, genreMapping);
        const stats = computeTasteStats(tracks, trackGenres);

        // Save a partial profile without archetype/narrative
        const partial: TasteProfile = {
          id: "latest",
          generatedAt: new Date().toISOString(),
          archetype: "",
          narrative: "",
          genreDistribution: stats.genreDistribution,
          eraDistribution: stats.eraDistribution,
          diversityScore: stats.diversityScore,
          trackCount: stats.totalTracks,
        };
        await db.tasteProfiles.put(partial);
        setProfile(partial);
        setStale(false);
      }

      setEnrichProgress({ phase: "complete" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setEnrichProgress({ phase: "error", error: msg });
    } finally {
      setLoading(false);
    }
  }, [tracks, llmConfig]);

  const hasLLM = llmConfig.isConfigured();

  // Estimate cost for the generate button
  const costEstimate = hasLLM
    ? estimateCost(llmConfig.provider, llmConfig.model, `${tracks.length * 30}`, 1500)
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">Taste Profile</h2>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : profile
              ? stale
                ? "Refresh Profile"
                : "Regenerate"
              : "Generate Profile"}
        </button>
      </div>

      {costEstimate && !profile && (
        <p className="mb-4 text-xs text-muted">
          Estimated cost: {formatCost(costEstimate.costUsd)} ({costEstimate.inputTokens.toLocaleString()} input tokens)
        </p>
      )}

      <EnrichmentProgress {...enrichProgress} />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {profile && (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="aspect-square max-h-[300px]">
            <GenreRadarChart
              genres={Object.entries(profile.genreDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([genre, percentage]) => ({ genre, percentage }))}
            />
          </div>
          <div className="space-y-4">
            {profile.archetype ? (
              <ArchetypeCard
                archetype={profile.archetype}
                narrative={profile.narrative}
              />
            ) : (
              <div className="rounded-md bg-background p-4">
                <p className="text-sm text-muted">
                  Add an LLM API key in Settings to unlock your personality archetype and taste narrative.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium">{Object.entries(profile.genreDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—"}</p>
                <p className="text-xs text-muted">Top Genre</p>
              </div>
              <div>
                <p className="font-medium">{Object.entries(profile.eraDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—"}</p>
                <p className="text-xs text-muted">Favorite Era</p>
              </div>
              <div>
                <p className="font-medium">{profile.diversityScore}</p>
                <p className="text-xs text-muted">Diversity Score</p>
              </div>
              <div>
                <p className="font-medium">{profile.trackCount.toLocaleString()}</p>
                <p className="text-xs text-muted">Tracks Analyzed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!profile && !loading && (
        <p className="mt-4 text-sm text-muted">
          Click "Generate Profile" to analyze your music taste.
          {!hasLLM && " Basic stats available without an API key; add one in Settings for full analysis."}
        </p>
      )}
    </div>
  );
}
