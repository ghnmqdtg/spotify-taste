import { spotifyFetch } from "./fetch";

const LIBRARY_BATCH_SIZE = 50;
const PLAYLIST_BATCH_SIZE = 100;

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function batchRemoveFromLibrary(
  trackUris: string[]
): Promise<void> {
  const batches = chunk(trackUris, LIBRARY_BATCH_SIZE);
  for (const batch of batches) {
    await spotifyFetch("/me/tracks", {
      method: "DELETE",
      body: JSON.stringify({ ids: batch.map(uriToId) }),
    });
  }
}

export async function batchAddToLibrary(trackUris: string[]): Promise<void> {
  const batches = chunk(trackUris, LIBRARY_BATCH_SIZE);
  for (const batch of batches) {
    await spotifyFetch("/me/tracks", {
      method: "PUT",
      body: JSON.stringify({ ids: batch.map(uriToId) }),
    });
  }
}

export async function batchAddToPlaylist(
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const batches = chunk(trackUris, PLAYLIST_BATCH_SIZE);
  for (const batch of batches) {
    await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({ uris: batch }),
    });
  }
}

export async function batchRemoveFromPlaylist(
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const batches = chunk(trackUris, PLAYLIST_BATCH_SIZE);
  for (const batch of batches) {
    await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      body: JSON.stringify({
        tracks: batch.map((uri) => ({ uri })),
      }),
    });
  }
}

export async function createPlaylist(
  userId: string,
  name: string,
  isPublic: boolean = false
): Promise<{ id: string; name: string }> {
  return spotifyFetch(`/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({ name, public: isPublic }),
  });
}

export interface SpotifyArtistFull {
  id: string;
  name: string;
  genres: string[];
  followers: { total: number };
}

/** Fetch full artist objects in batches of 50. Returns artist data including genres. */
export async function batchGetArtists(
  artistIds: string[],
  onBatch?: (completed: number, total: number) => void
): Promise<SpotifyArtistFull[]> {
  const batches = chunk(artistIds, LIBRARY_BATCH_SIZE);
  const results: SpotifyArtistFull[] = [];
  let completed = 0;

  for (const batch of batches) {
    const response = await spotifyFetch<{ artists: SpotifyArtistFull[] }>(
      `/artists?ids=${batch.join(",")}`
    );
    results.push(...response.artists.filter(Boolean));
    completed += batch.length;
    onBatch?.(Math.min(completed, artistIds.length), artistIds.length);
  }

  return results;
}

function uriToId(uri: string): string {
  // "spotify:track:6rqhFgbbKwnb9MLmUQDhG6" → "6rqhFgbbKwnb9MLmUQDhG6"
  const parts = uri.split(":");
  return parts[parts.length - 1];
}
