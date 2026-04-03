import {
  spotifyFetch,
  normalizeTrack,
  type SpotifySavedTrack,
  type SpotifyPaginatedResponse,
} from "@spotify-liked-songs-manager/spotify-client";
import { db, getSyncMeta, setSyncMeta } from "./db";

const PAGE_SIZE = 50;
const FULL_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SyncProgress {
  phase: "incremental" | "full";
  fetched: number;
  total: number | null;
  done: boolean;
}

type ProgressCallback = (progress: SyncProgress) => void;

export async function incrementalSync(
  onProgress?: ProgressCallback
): Promise<void> {
  const lastSyncTime = await getSyncMeta("lastIncrementalSync");
  let offset = 0;
  let total: number | null = null;
  let fetched = 0;
  let reachedKnown = false;

  while (!reachedKnown) {
    const response = await spotifyFetch<
      SpotifyPaginatedResponse<SpotifySavedTrack>
    >(`/me/tracks?limit=${PAGE_SIZE}&offset=${offset}`);

    total = response.total;

    for (const item of response.items) {
      // If we have a previous sync time and this track was already synced, stop
      if (lastSyncTime && item.added_at <= lastSyncTime) {
        const existing = await db.likedTracks.get(item.track.uri);
        if (existing) {
          reachedKnown = true;
          break;
        }
      }

      const track = normalizeTrack(item);
      await db.likedTracks.put(track);
      fetched++;
    }

    onProgress?.({
      phase: "incremental",
      fetched,
      total,
      done: false,
    });

    if (!response.next || reachedKnown) break;
    offset += PAGE_SIZE;
  }

  await setSyncMeta("lastIncrementalSync", new Date().toISOString());
  await setSyncMeta("totalCount", String(total ?? fetched));

  onProgress?.({
    phase: "incremental",
    fetched,
    total,
    done: true,
  });
}

export async function fullSync(onProgress?: ProgressCallback): Promise<void> {
  let offset = 0;
  let total: number | null = null;
  let fetched = 0;
  const seenUris = new Set<string>();

  // Fetch all pages
  while (true) {
    const response = await spotifyFetch<
      SpotifyPaginatedResponse<SpotifySavedTrack>
    >(`/me/tracks?limit=${PAGE_SIZE}&offset=${offset}`);

    total = response.total;

    const tracks = response.items.map((item) => {
      const track = normalizeTrack(item);
      seenUris.add(track.uri);
      return track;
    });

    await db.likedTracks.bulkPut(tracks);
    fetched += tracks.length;

    onProgress?.({
      phase: "full",
      fetched,
      total,
      done: false,
    });

    if (!response.next) break;
    offset += PAGE_SIZE;
  }

  // Remove tracks that are no longer in the library
  const allLocalUris = await db.likedTracks.toCollection().primaryKeys();
  const staleUris = allLocalUris.filter((uri) => !seenUris.has(uri));
  if (staleUris.length > 0) {
    await db.likedTracks.bulkDelete(staleUris);
  }

  await setSyncMeta("lastFullSync", new Date().toISOString());
  await setSyncMeta("lastIncrementalSync", new Date().toISOString());
  await setSyncMeta("totalCount", String(total ?? fetched));

  onProgress?.({
    phase: "full",
    fetched,
    total,
    done: true,
  });
}

export async function shouldFullSync(): Promise<boolean> {
  const lastFullSync = await getSyncMeta("lastFullSync");
  if (!lastFullSync) return true;
  const elapsed = Date.now() - new Date(lastFullSync).getTime();
  return elapsed > FULL_SYNC_INTERVAL_MS;
}

export async function autoSync(
  onProgress?: ProgressCallback
): Promise<void> {
  if (await shouldFullSync()) {
    await fullSync(onProgress);
  } else {
    await incrementalSync(onProgress);
  }
}
