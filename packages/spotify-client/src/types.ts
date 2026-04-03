// Spotify API response types

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: "year" | "month" | "day";
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
}

export interface SpotifySavedTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface SpotifyPaginatedResponse<T> {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: SpotifyUser;
  public: boolean;
  tracks: { total: number };
  uri: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email?: string;
  images: SpotifyImage[];
  uri: string;
}

// App-level types (normalized from Spotify API)

export interface LikedTrack {
  uri: string;
  addedAt: string;
  name: string;
  artistIds: string[];
  artistNames: string[];
  albumName: string;
  albumImageUrl: string;
  durationMs: number;
  explicit: boolean;
  releaseDate: string;
}

export function normalizeTrack(saved: SpotifySavedTrack): LikedTrack {
  const { track } = saved;
  return {
    uri: track.uri,
    addedAt: saved.added_at,
    name: track.name,
    artistIds: track.artists.map((a) => a.id),
    artistNames: track.artists.map((a) => a.name),
    albumName: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? "",
    durationMs: track.duration_ms,
    explicit: track.explicit,
    releaseDate: track.album.release_date,
  };
}
