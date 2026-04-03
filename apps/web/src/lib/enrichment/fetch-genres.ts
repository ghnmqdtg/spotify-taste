import { batchGetArtists } from "@spotify-taste/spotify-client";
import { db, type ArtistGenreRecord } from "@/lib/db";

export interface FetchGenresProgress {
  phase: "fetching";
  completed: number;
  total: number;
}

/**
 * Collect unique artist IDs from liked tracks, fetch genres via Spotify API,
 * and cache in IndexedDB. Skips already-cached artists.
 */
export async function fetchArtistGenres(
  onProgress?: (progress: FetchGenresProgress) => void
): Promise<ArtistGenreRecord[]> {
  // Get all unique artist IDs from liked tracks
  const tracks = await db.likedTracks.toArray();
  const allArtistIds = new Set(tracks.flatMap((t) => t.artistIds ?? []));

  // Check which artists we already have cached
  const cached = await db.artistGenres.toArray();
  const cachedIds = new Set(cached.map((a) => a.artistId));
  const missingIds = [...allArtistIds].filter((id) => !cachedIds.has(id));

  if (missingIds.length === 0) {
    return cached;
  }

  // Fetch missing artists from Spotify
  const artists = await batchGetArtists(missingIds, (completed, total) => {
    onProgress?.({ phase: "fetching", completed, total });
  });

  // Store in IndexedDB
  const newRecords: ArtistGenreRecord[] = artists.map((a) => ({
    artistId: a.id,
    genres: a.genres,
  }));

  await db.artistGenres.bulkPut(newRecords);

  return [...cached, ...newRecords];
}
