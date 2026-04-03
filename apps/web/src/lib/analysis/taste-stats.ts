import type { LikedTrack } from "@spotify-taste/spotify-client";
import type { TrackGenres } from "@/lib/enrichment";

export interface TasteStats {
  genreDistribution: Record<string, number>;
  eraDistribution: Record<string, number>;
  listeningVelocity: { month: string; count: number }[];
  diversityScore: number;
  totalTracks: number;
  topGenres: { genre: string; percentage: number }[];
  topEra: string;
}

/**
 * Compute deterministic taste statistics from enriched library data.
 */
export function computeTasteStats(
  tracks: LikedTrack[],
  trackGenres: TrackGenres[]
): TasteStats {
  const totalTracks = tracks.length;

  // Genre distribution (percentage per macro category)
  const genreCounts: Record<string, number> = {};
  for (const tg of trackGenres) {
    const genre = tg.primaryGenre;
    genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
  }
  const genreDistribution: Record<string, number> = {};
  for (const [genre, count] of Object.entries(genreCounts)) {
    genreDistribution[genre] = Math.round((count / totalTracks) * 100);
  }

  // Era distribution (by decade)
  const eraCounts: Record<string, number> = {};
  for (const track of tracks) {
    const year = parseInt(track.releaseDate?.substring(0, 4) ?? "0", 10);
    if (year > 0) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      eraCounts[decade] = (eraCounts[decade] ?? 0) + 1;
    }
  }
  const eraDistribution: Record<string, number> = {};
  for (const [era, count] of Object.entries(eraCounts)) {
    eraDistribution[era] = Math.round((count / totalTracks) * 100);
  }

  // Listening velocity (likes per month)
  const monthCounts: Record<string, number> = {};
  for (const track of tracks) {
    const month = track.addedAt.substring(0, 7); // "YYYY-MM"
    monthCounts[month] = (monthCounts[month] ?? 0) + 1;
  }
  const listeningVelocity = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Artist diversity score
  const uniqueArtists = new Set(tracks.flatMap((t) => t.artistNames)).size;
  const diversityScore = totalTracks > 0
    ? Math.round((uniqueArtists / totalTracks) * 100) / 100
    : 0;

  // Top genres sorted by percentage
  const topGenres = Object.entries(genreDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([genre, percentage]) => ({ genre, percentage }));

  // Top era
  const topEra = Object.entries(eraDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Unknown";

  return {
    genreDistribution,
    eraDistribution,
    listeningVelocity,
    diversityScore,
    totalTracks,
    topGenres,
    topEra,
  };
}
