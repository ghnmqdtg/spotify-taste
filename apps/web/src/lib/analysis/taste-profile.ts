import type { LLMProvider } from "@spotify-taste/llm-provider";
import { parseLLMJson } from "@spotify-taste/llm-provider";
import { db, type TasteProfile } from "@/lib/db";
import type { TasteStats } from "./taste-stats";

const ARCHETYPES = [
  "Archaeologist — Deep historical focus, loves classics and older music",
  "Eclectic Explorer — Wide genre spread, always discovering new sounds",
  "Loyalist — Few artists, many tracks per artist, deep devotion",
  "Curator — Balanced and intentional, well-rounded collection",
  "Mood Surfer — High genre variance, music matches the moment",
  "Scene Kid — Concentrated in niche genres, deep subcultural ties",
  "Mainstream Navigator — Popular genres and trending artists",
];

const TASTE_PROFILE_PROMPT = `You are a music taste analyst. Given the following listening statistics, determine:

1. Which personality archetype best fits (choose exactly one):
${ARCHETYPES.map((a) => `   - ${a}`).join("\n")}

2. A 3-5 sentence narrative describing this listener's musical taste. Reference specific genres, eras, and patterns. Be engaging and insightful.

3. The top 3 data points that support your archetype choice.

IMPORTANT: Respond with ONLY a valid JSON object, no other text before or after:
{"archetype": "Archetype Name", "narrative": "Your narrative here", "supportingPoints": ["point 1", "point 2", "point 3"]}

Listening Statistics:`;

interface ProfileLLMResponse {
  archetype: string;
  narrative: string;
  supportingPoints: string[];
}

export async function generateTasteProfile(
  stats: TasteStats,
  provider: LLMProvider
): Promise<TasteProfile> {
  const statsSummary = [
    `Total tracks: ${stats.totalTracks}`,
    `Top genres: ${stats.topGenres.map((g) => `${g.genre} (${g.percentage}%)`).join(", ")}`,
    `Era distribution: ${Object.entries(stats.eraDistribution).sort(([, a], [, b]) => b - a).map(([era, pct]) => `${era}: ${pct}%`).join(", ")}`,
    `Favorite era: ${stats.topEra}`,
    `Artist diversity score: ${stats.diversityScore} (${stats.diversityScore > 0.7 ? "very diverse" : stats.diversityScore > 0.4 ? "moderate" : "loyal to favorites"})`,
    `Monthly listening velocity: avg ${Math.round(stats.listeningVelocity.reduce((s, v) => s + v.count, 0) / Math.max(stats.listeningVelocity.length, 1))} tracks/month`,
  ].join("\n");

  const response = await provider.complete([
    { role: "user", content: `${TASTE_PROFILE_PROMPT}\n${statsSummary}` },
  ], { temperature: 0.7 });

  const parsed = parseLLMJson<ProfileLLMResponse>(response);

  const profile: TasteProfile = {
    id: "latest",
    generatedAt: new Date().toISOString(),
    archetype: parsed.archetype,
    narrative: parsed.narrative,
    genreDistribution: stats.genreDistribution,
    eraDistribution: stats.eraDistribution,
    diversityScore: stats.diversityScore,
    trackCount: stats.totalTracks,
  };

  await db.tasteProfiles.put(profile);
  return profile;
}

export async function getCachedProfile(): Promise<TasteProfile | undefined> {
  return db.tasteProfiles.get("latest");
}

export function isProfileStale(
  profile: TasteProfile,
  currentTrackCount: number
): boolean {
  const age = Date.now() - new Date(profile.generatedAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const significantGrowth = currentTrackCount - profile.trackCount > 50;
  return age > sevenDays || significantGrowth;
}
