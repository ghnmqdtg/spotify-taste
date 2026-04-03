import type { LikedTrack } from "@spotify-taste/spotify-client";
import type { LLMProvider } from "@spotify-taste/llm-provider";
import type { TrackGenres } from "@/lib/enrichment";

// ---- Genre Evolution ----

export interface GenreEvolutionData {
  monthlyGenres: { month: string; genres: Record<string, number> }[];
  narrative?: string;
}

export function computeMonthlyGenreDistributions(
  tracks: LikedTrack[],
  trackGenres: TrackGenres[]
): { month: string; genres: Record<string, number> }[] {
  const genreByUri = new Map(trackGenres.map((tg) => [tg.uri, tg.primaryGenre]));
  const monthly: Record<string, Record<string, number>> = {};

  for (const track of tracks) {
    const month = track.addedAt.substring(0, 7);
    const genre = genreByUri.get(track.uri) ?? "Unknown";
    if (!monthly[month]) monthly[month] = {};
    monthly[month][genre] = (monthly[month][genre] ?? 0) + 1;
  }

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, genres]) => ({ month, genres }));
}

export async function generateGenreEvolutionNarrative(
  monthlyGenres: { month: string; genres: Record<string, number> }[],
  provider: LLMProvider
): Promise<string> {
  const summary = monthlyGenres
    .map((m) => {
      const top = Object.entries(m.genres).sort(([, a], [, b]) => b - a).slice(0, 3);
      return `${m.month}: ${top.map(([g, c]) => `${g}(${c})`).join(", ")}`;
    })
    .join("\n");

  return provider.complete([
    {
      role: "user",
      content: `You are a music taste analyst. Given monthly genre distributions over time, write a 3-4 sentence narrative describing how this listener's taste has evolved. Note shifts, discoveries, and phases.\n\nMonthly data:\n${summary}`,
    },
  ], { temperature: 0.7, maxTokens: 300 });
}

// ---- Hidden Gems ----

export interface HiddenGem {
  uri: string;
  name: string;
  artistNames: string[];
  description?: string;
}

export function findHiddenGems(tracks: LikedTrack[]): HiddenGem[] {
  // Count tracks per artist
  const artistCounts: Record<string, number> = {};
  for (const track of tracks) {
    for (const artist of track.artistNames) {
      artistCounts[artist] = (artistCounts[artist] ?? 0) + 1;
    }
  }

  // Top 20 artists by track count
  const top20 = new Set(
    Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([name]) => name)
  );

  // Filter: artists with <3 tracks and not in top 20
  return tracks
    .filter((t) =>
      t.artistNames.some((a) => (artistCounts[a] ?? 0) < 3 && !top20.has(a))
    )
    .slice(0, 20)
    .map((t) => ({ uri: t.uri, name: t.name, artistNames: t.artistNames }));
}

export async function enhanceGemsWithLLM(
  gems: HiddenGem[],
  provider: LLMProvider
): Promise<HiddenGem[]> {
  const trackList = gems
    .map((g, i) => `#${i + 1}|${g.name}|${g.artistNames.join(", ")}`)
    .join("\n");

  const response = await provider.complete([
    {
      role: "user",
      content: `For each track below, write a one-sentence description of why it might be a hidden gem (what makes it notable, how it differs from mainstream). Return JSON array of strings, one per track.\n\n${trackList}`,
    },
  ], { temperature: 0.7, maxTokens: 500 });

  try {
    const descriptions: string[] = JSON.parse(
      response.match(/\[[\s\S]*\]/)?.[0] ?? "[]"
    );
    return gems.map((g, i) => ({
      ...g,
      description: descriptions[i] ?? undefined,
    }));
  } catch {
    return gems;
  }
}

// ---- Listening Patterns ----

export interface ListeningPatterns {
  binges: { date: string; count: number; topArtist: string; topGenre: string }[];
  discoveryBursts: { weekStart: string; newArtistCount: number }[];
}

export function detectListeningPatterns(
  tracks: LikedTrack[],
  trackGenres: TrackGenres[]
): ListeningPatterns {
  const genreByUri = new Map(trackGenres.map((tg) => [tg.uri, tg.primaryGenre]));

  // Binge detection: >10 tracks added in one day
  const byDay: Record<string, LikedTrack[]> = {};
  for (const track of tracks) {
    const day = track.addedAt.substring(0, 10);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(track);
  }

  const binges = Object.entries(byDay)
    .filter(([, dayTracks]) => dayTracks.length > 10)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10)
    .map(([date, dayTracks]) => {
      const artistCounts: Record<string, number> = {};
      const genreCounts: Record<string, number> = {};
      for (const t of dayTracks) {
        for (const a of t.artistNames) artistCounts[a] = (artistCounts[a] ?? 0) + 1;
        const genre = genreByUri.get(t.uri) ?? "Unknown";
        genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
      }
      const topArtist = Object.entries(artistCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";
      const topGenre = Object.entries(genreCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";
      return { date, count: dayTracks.length, topArtist, topGenre };
    });

  // Discovery bursts: 7-day windows where >5 new artists appeared
  const sortedTracks = [...tracks].sort(
    (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
  );
  const seenArtists = new Set<string>();
  const weeklyNewArtists: Record<string, Set<string>> = {};

  for (const track of sortedTracks) {
    const date = new Date(track.addedAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().substring(0, 10);

    for (const artist of track.artistNames) {
      if (!seenArtists.has(artist)) {
        seenArtists.add(artist);
        if (!weeklyNewArtists[weekKey]) weeklyNewArtists[weekKey] = new Set();
        weeklyNewArtists[weekKey].add(artist);
      }
    }
  }

  const discoveryBursts = Object.entries(weeklyNewArtists)
    .filter(([, artists]) => artists.size > 5)
    .sort(([, a], [, b]) => b.size - a.size)
    .slice(0, 10)
    .map(([weekStart, artists]) => ({
      weekStart,
      newArtistCount: artists.size,
    }));

  return { binges, discoveryBursts };
}
