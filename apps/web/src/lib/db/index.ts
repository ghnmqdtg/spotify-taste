import Dexie, { type EntityTable } from "dexie";
import type { LikedTrack } from "@spotify-liked-songs-manager/spotify-client";

export interface SyncMetadata {
  key: string;
  value: string;
}

export class AppDatabase extends Dexie {
  likedTracks!: EntityTable<LikedTrack, "uri">;
  syncMetadata!: EntityTable<SyncMetadata, "key">;

  constructor() {
    super("SpotifyLikedSongsManager");

    this.version(1).stores({
      likedTracks: "uri, addedAt, name, *artistNames, albumName, explicit, releaseDate",
      syncMetadata: "key",
    });
  }
}

export const db = new AppDatabase();

// Sync metadata helpers
export async function getSyncMeta(key: string): Promise<string | undefined> {
  const record = await db.syncMetadata.get(key);
  return record?.value;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  await db.syncMetadata.put({ key, value });
}
