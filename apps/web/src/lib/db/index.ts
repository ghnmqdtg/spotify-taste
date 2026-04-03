import Dexie, { type EntityTable } from "dexie";
import type { LikedTrack } from "@spotify-taste/spotify-client";

export interface SyncMetadata {
  key: string;
  value: string;
}

export interface ArtistGenreRecord {
  artistId: string;
  genres: string[];
}

export interface GenreMapping {
  microGenre: string;
  macroCategory: string;
}

export interface TasteProfile {
  id: string;
  generatedAt: string;
  archetype: string;
  narrative: string;
  genreDistribution: Record<string, number>;
  eraDistribution: Record<string, number>;
  diversityScore: number;
  trackCount: number;
}

export class AppDatabase extends Dexie {
  likedTracks!: EntityTable<LikedTrack, "uri">;
  syncMetadata!: EntityTable<SyncMetadata, "key">;
  artistGenres!: EntityTable<ArtistGenreRecord, "artistId">;
  genreMappings!: EntityTable<GenreMapping, "microGenre">;
  tasteProfiles!: EntityTable<TasteProfile, "id">;

  constructor() {
    super("SpotifyTaste");

    this.version(1).stores({
      likedTracks: "uri, addedAt, name, *artistNames, albumName, explicit, releaseDate",
      syncMetadata: "key",
    });

    this.version(2).stores({
      likedTracks: "uri, addedAt, name, *artistNames, albumName, explicit, releaseDate",
      syncMetadata: "key",
      artistGenres: "artistId",
      genreMappings: "microGenre",
      tasteProfiles: "id, generatedAt",
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
