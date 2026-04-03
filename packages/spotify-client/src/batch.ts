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

function uriToId(uri: string): string {
  // "spotify:track:6rqhFgbbKwnb9MLmUQDhG6" → "6rqhFgbbKwnb9MLmUQDhG6"
  const parts = uri.split(":");
  return parts[parts.length - 1];
}
